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

test.describe('Intermediate calculator', () => {
  test.beforeEach(async ({ context }) => {
    await seedDemoPreferences(context, 'en');
  });

  test('renders with the path switch and derives the weight from the size', async ({
    page,
  }) => {
    await page.goto('/tabs/calculator/intermediate');
    await waitForAppReady(page);

    await expect(page.locator('app-intermediate-form')).toBeVisible();
    await expect(page.locator('app-calculator-path-switch')).toBeVisible();

    const sizeTile = page.locator('[data-testid="size-tile"]');
    const ballWeight = page.locator('[data-testid="ball-weight"]');
    const before = await ballWeight.textContent();

    // The + stepper of the size tile: one more centimetre, a heavier ball.
    await sizeTile.locator('.ctrl button').nth(1).click();

    await expect(ballWeight).not.toHaveText(before ?? '');
  });

  test('opens its own Method from the CTA', async ({ page }) => {
    await page.goto('/tabs/calculator/intermediate');
    await waitForAppReady(page);

    await page.locator('app-intermediate-form .calculator-cta').click();

    await expect(page).toHaveURL(/\/tabs\/calculator\/method\/intermediate$/);
    await expect(page.locator('app-method')).toBeVisible();
  });
});
