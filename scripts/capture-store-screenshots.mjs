import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:4200").replace(/\/$/, "");
const chromeBinary =
  process.env["STORE_CHROME_BINARY"] ?? "/usr/bin/google-chrome";
const projectRoot = resolve(import.meta.dirname, "..");
const appearance = process.env["PIZZA_SCREENSHOT_APPEARANCE"] ?? "light";
const metadataRoot = resolve(
  process.env["PIZZA_SCREENSHOT_OUTPUT_ROOT"] ??
    join(projectRoot, "fastlane", "metadata", "android"),
);
const profileDirectory = mkdtempSync(join(tmpdir(), "pizza-store-shots-"));

const demoInput = {
  nbPizzas: 6,
  doughType: "poolish",
  yeastType: "dry_active",
  hydrationRatio: 0.65,
  temperature: 21,
  poolishRatio: 0.4,
  globalRestTime: 24,
  rtRestTime: 4,
  coldRestTime: 20,
  flourStrength: 280,
  saltRatio: 0.028,
  honeyRatio: 0.004,
  pizzaWeight: 260,
  pizzaType: "neapolitan",
  oliveOilRatio: 0,
};

const locales = [
  {
    id: "en-US",
    language: "en",
    screenshots: [
      ["1-expert-calculator.png", "/tabs/calculator/expert"],
      ["2-guided-calculator.png", "/tabs/calculator/guided"],
      ["3-pizza-recipes.png", "/tabs/recipes"],
      ["4-my-doughs.png", "/tabs/doughs"],
    ],
  },
  {
    id: "fr-FR",
    language: "fr",
    screenshots: [
      ["1-calculateur-expert.png", "/tabs/calculator/expert"],
      ["2-parcours-guide.png", "/tabs/calculator/guided"],
      ["3-recettes-pizza.png", "/tabs/recipes"],
      ["4-mes-pates.png", "/tabs/doughs"],
    ],
  },
];

if (!existsSync(chromeBinary)) {
  throw new Error(
    `Chrome not found at ${chromeBinary}. Set STORE_CHROME_BINARY to its path.`,
  );
}
if (!["light", "dark"].includes(appearance)) {
  throw new Error("PIZZA_SCREENSHOT_APPEARANCE must be light or dark.");
}

const response = await fetch(baseUrl);
if (!response.ok) {
  throw new Error(
    `The app must be running at ${baseUrl} (received HTTP ${response.status}).`,
  );
}

const chrome = spawn(
  chromeBinary,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDirectory}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  const port = await readDevToolsPort(profileDirectory);
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(
    (res) => res.json(),
  );
  const page = targets.find((target) => target.type === "page");
  if (!page) {
    throw new Error("Chrome did not expose a page target.");
  }

  const cdp = await connectCdp(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 360,
    height: 640,
    deviceScaleFactor: 3,
    mobile: true,
    screenWidth: 360,
    screenHeight: 640,
  });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await cdp.send("Emulation.setScrollbarsHidden", { hidden: true });

  for (const locale of locales) {
    await seedPreferences(cdp, locale.language);
    await cdp.send("Emulation.setLocaleOverride", { locale: locale.id });

    const outputDirectory = join(
      metadataRoot,
      locale.id,
      "images",
      "phoneScreenshots",
    );
    mkdirSync(outputDirectory, { recursive: true });

    for (const [filename, route] of locale.screenshots) {
      await navigateAndSettle(cdp, `${baseUrl}${route}`);
      const screenshot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      writeFileSync(
        join(outputDirectory, filename),
        Buffer.from(screenshot.data, "base64"),
      );
    }
  }

  cdp.close();
} finally {
  if (chrome.exitCode === null) {
    chrome.kill("SIGTERM");
    await Promise.race([once(chrome, "exit"), delay(2_000)]);
  }
  if (chrome.exitCode === null) {
    chrome.kill("SIGKILL");
    await once(chrome, "exit");
  }
  rmSync(profileDirectory, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });
}

async function seedPreferences(cdp, language) {
  await navigateAndSettle(cdp, baseUrl);
  const preferences = {
    "3:schema-version": stored(6),
    "3:locale:current": stored(language),
    "3:appearance": stored(appearance),
    "3:keepAwake": stored(false),
    "3:calculator:draft": stored(demoInput),
    "3:calculator:doughs": stored(demoDoughs(language)),
  };
  await cdp.send("Runtime.evaluate", {
    expression: `localStorage.clear(); Object.entries(${JSON.stringify(
      preferences,
    )}).forEach(([key, value]) => localStorage.setItem(key, value));`,
  });
}

function demoDoughs(language) {
  const names =
    language === "fr"
      ? ["Poolish du samedi", "Margherita express"]
      : ["Saturday poolish", "Quick Margherita"];
  return [
    {
      id: "store-poolish",
      name: names[0],
      input: demoInput,
      createdAt: "2026-07-18T18:00:00.000Z",
      updatedAt: "2026-07-18T18:00:00.000Z",
    },
    {
      id: "store-express",
      name: names[1],
      input: {
        ...demoInput,
        nbPizzas: 4,
        doughType: "direct",
        hydrationRatio: 0.62,
        globalRestTime: 8,
        rtRestTime: 8,
        coldRestTime: 0,
      },
      createdAt: "2026-07-17T18:00:00.000Z",
      updatedAt: "2026-07-17T18:00:00.000Z",
    },
  ];
}

async function navigateAndSettle(cdp, url) {
  await cdp.send("Page.navigate", { url });
  await cdp.send("Runtime.evaluate", {
    expression: `new Promise((resolve, reject) => {
      const deadline = Date.now() + 15000;
      const ready = () => {
        const app = document.querySelector('ion-app');
        const content = document.body?.innerText?.trim() ?? '';
        if (document.readyState === 'complete' && app && content.length > 40) {
          document.fonts.ready.then(() => setTimeout(resolve, 800));
        } else if (Date.now() > deadline) {
          reject(new Error('Timed out waiting for the app to render'));
        } else {
          setTimeout(ready, 100);
        }
      };
      ready();
    })`,
    awaitPromise: true,
  });
}

async function readDevToolsPort(directory) {
  const portFile = join(directory, "DevToolsActivePort");
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(portFile)) {
      return Number.parseInt(readFileSync(portFile, "utf8").split("\n")[0], 10);
    }
    await delay(100);
  }
  throw new Error("Chrome DevTools did not start.");
}

async function connectCdp(url) {
  const socket = new WebSocket(url);
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) {
      return;
    }
    const { resolve: resolveCall, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message));
    } else {
      resolveCall(message.result);
    }
  });

  return {
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolveCall, reject) => {
        pending.set(id, { resolve: resolveCall, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}

function stored(value) {
  return JSON.stringify({ value, expiresAt: null });
}
