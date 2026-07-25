import { expect, test } from '@playwright/test';

import { seedDemoPreferences, waitForAppReady } from './fixtures';

test.describe('Primary tabs', () => {
  test.beforeEach(async ({ context, page }) => {
    await seedDemoPreferences(context, 'en');
    await page.goto('/tabs/calculator/expert');
    await waitForAppReady(page);
  });

  test('recipes tab shows the bundled catalog', async ({ page }) => {
    await page.goto('/tabs/recipes');

    await expect(
      page.getByText('Choose your next pizza', { exact: false }),
    ).toBeVisible();
  });

  test('doughs tab lists the seeded doughs', async ({ page }) => {
    await page.goto('/tabs/doughs');

    await expect(page.getByText('Saturday poolish')).toBeVisible();
    await expect(page.getByText('Quick Margherita')).toBeVisible();
  });

  test('french locale renders translated labels', async ({
    context,
    page,
  }) => {
    await seedDemoPreferences(context, 'fr');
    await page.goto('/tabs/doughs');

    await expect(page.getByText('Poolish du samedi')).toBeVisible();
    await expect(page.getByText('Mes pâtes').first()).toBeVisible();
  });
});
