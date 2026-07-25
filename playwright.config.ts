import { defineConfig } from '@playwright/test';

/**
 * E2E tests run against the system Chrome (no `playwright install` needed)
 * and the Angular dev server, started automatically by `webServer`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:4200',
    channel: 'chrome',
    headless: true,
    // Match the Ionic mobile shell (same metrics as the store capture script).
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  // `localhost`, not `127.0.0.1`: bare `npm start` binds whatever localhost
  // resolves to (::1 on a dual-stack box), so pinning the IPv4 literal here
  // made reuseExistingServer miss a running dev server and boot a second one.
  webServer: {
    command: 'npm start -- --host localhost --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
