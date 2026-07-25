import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { chromium } from "playwright";

// `localhost` so a plain `npm start` is found on a dual-stack box, where the
// dev server binds ::1 and the IPv4 literal answers nothing.
const baseUrl = (process.argv[2] ?? "http://localhost:4200").replace(/\/$/, "");
const chromeBinary =
  process.env["STORE_CHROME_BINARY"] ?? "/usr/bin/google-chrome";
const projectRoot = resolve(import.meta.dirname, "..");
const appearance = process.env["PIZZA_SCREENSHOT_APPEARANCE"] ?? "light";
const metadataRoot = resolve(
  process.env["PIZZA_SCREENSHOT_OUTPUT_ROOT"] ??
    join(projectRoot, "fastlane", "metadata", "android"),
);

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

const browser = await chromium.launch({
  executablePath: chromeBinary,
  args: ["--no-sandbox", "--hide-scrollbars"],
});

try {
  for (const locale of locales) {
    const context = await browser.newContext({
      viewport: { width: 360, height: 640 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      locale: locale.id,
    });
    // Seeded before any app script runs, on every navigation of this context.
    await context.addInitScript(seedPreferences, {
      language: locale.language,
      appearance,
      demoInput,
      demoDoughs: demoDoughs(locale.language),
    });

    const outputDirectory = join(
      metadataRoot,
      locale.id,
      "images",
      "phoneScreenshots",
    );
    mkdirSync(outputDirectory, { recursive: true });

    const page = await context.newPage();
    for (const [filename, route] of locale.screenshots) {
      await page.goto(`${baseUrl}${route}`);
      await waitForAppRender(page);
      await page.screenshot({ path: join(outputDirectory, filename) });
      console.log(`✓ ${locale.id}/${filename}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

// Runs in the page; keep it dependency-free (Playwright serializes it).
function seedPreferences({ language, appearance, demoInput, demoDoughs }) {
  try {
    const stored = (value) => JSON.stringify({ value, expiresAt: null });
    localStorage.clear();
    localStorage.setItem("3:schema-version", stored(6));
    localStorage.setItem("3:locale:current", stored(language));
    localStorage.setItem("3:appearance", stored(appearance));
    localStorage.setItem("3:keepAwake", stored(false));
    localStorage.setItem("3:calculator:draft", stored(demoInput));
    localStorage.setItem("3:calculator:doughs", stored(demoDoughs));
  } catch {
    // Opaque origins (about:blank) expose no usable localStorage; ignore.
  }
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

async function waitForAppRender(page) {
  await page.waitForFunction(() => {
    const app = document.querySelector("ion-app");
    const content = document.body?.innerText?.trim() ?? "";
    return document.readyState === "complete" && app && content.length > 40;
  });
  await page.evaluate(() => document.fonts.ready);
  // Let Ionic transitions and late paints settle before capturing.
  await page.waitForTimeout(800);
}
