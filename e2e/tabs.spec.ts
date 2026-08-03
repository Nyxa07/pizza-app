import { expect, test } from '@playwright/test';

import { PIZZA_RECIPE_CATALOG } from '../src/app/features/recipes/recipes.catalog';

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
    await expect(page.getByText('Four cheeses')).toBeVisible();
  });

  test('every recipe card renders its bundled photo', async ({ page }) => {
    await page.goto('/tabs/recipes');

    const visuals = page.locator('app-recipes-page img');
    await expect(visuals.first()).toBeVisible();
    // Scroll the whole grid into view so the lazy-loaded visuals all decode.
    await visuals.last().scrollIntoViewIfNeeded();

    const count = PIZZA_RECIPE_CATALOG.length;
    await expect(visuals).toHaveCount(count);

    for (let index = 0; index < count; index++) {
      // A missing or misnamed asset resolves to a zero-width image.
      await expect
        .poll(() =>
          visuals
            .nth(index)
            .evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBeGreaterThan(0);
    }
  });

  test('a recipe detail credits its photo and calls it illustrative', async ({
    page,
  }) => {
    await page.goto('/tabs/recipes');
    await page.getByRole('button', { name: /La Régalade/ }).click();

    const caption = page.locator('app-recipe-detail-page figcaption');
    await expect(caption).toContainText('Gotta Be Worth It');
    await expect(caption).toContainText('Illustrative photo');
  });

  test('doughs tab lists the seeded doughs', async ({ page }) => {
    await page.goto('/tabs/doughs');

    await expect(page.getByText('Saturday poolish')).toBeVisible();
    await expect(page.getByText('Quick Margherita')).toBeVisible();
  });

  test('french locale renders translated labels', async ({ context, page }) => {
    await seedDemoPreferences(context, 'fr');
    await page.goto('/tabs/doughs');

    await expect(page.getByText('Poolish du samedi')).toBeVisible();
    await expect(page.getByText('Mes pâtes').first()).toBeVisible();
  });
});
