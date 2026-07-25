import { expect, test } from '@playwright/test';

import { seedDemoPreferences, waitForAppReady } from './fixtures';

test.describe('Expert calculator', () => {
  test.beforeEach(async ({ context }) => {
    await seedDemoPreferences(context, 'en');
  });

  test('renders the initialized form from the seeded draft', async ({
    page,
  }) => {
    await page.goto('/tabs/calculator/expert');
    await waitForAppReady(page);

    await expect(page.locator('app-expert-form')).toBeVisible();
    await expect(page.locator('app-calculator-path-switch')).toBeVisible();
  });

  test('guided path renders as well', async ({ page }) => {
    await page.goto('/tabs/calculator/guided');
    await waitForAppReady(page);

    await expect(page.locator('app-guided-form')).toBeVisible();
  });
});
