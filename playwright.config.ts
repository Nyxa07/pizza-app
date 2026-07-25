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
    baseURL: 'http://127.0.0.1:4200',
    channel: 'chrome',
    headless: true,
    // Match the Ionic mobile shell (same metrics as the store capture script).
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4200',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
