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

  test('holds its layout at an enlarged system font size', async ({ page }) => {
    await page.goto('/tabs/calculator/intermediate');
    await waitForAppReady(page);

    // Stands in for a phone whose system font scale is turned up: every type
    // size in the app is in `rem`, the control boxes are in pixels (#104).
    await page.addStyleTag({ content: ':root { font-size: 20px }' });

    const form = page.locator('app-intermediate-form');
    await expect(form).toBeVisible();

    const overflowing = await form.evaluate((root) => {
      const name = (element: Element) => element.className || element.tagName;
      const escaped: string[] = [];

      const viewport = document.documentElement.clientWidth + 1;
      for (const element of root.querySelectorAll('*')) {
        if (element.getBoundingClientRect().right > viewport) {
          escaped.push(`past the viewport: ${name(element)}`);
        }
      }

      // A tile that cannot fold its steppers pushes its reading out of its own
      // card instead — invisible from the viewport, glaring on the screen.
      for (const tile of root.querySelectorAll('app-calculator-tile')) {
        const edge = tile.getBoundingClientRect().right + 0.5;
        for (const element of tile.querySelectorAll('*')) {
          if (element.getBoundingClientRect().right > edge) {
            escaped.push(`out of its tile: ${name(element)}`);
          }
        }
      }

      return escaped;
    });
    expect(overflowing, 'everything stays inside its box').toEqual([]);

    // The size reads on a single line, unit included — as tall as the bare
    // count in the tile beside it, not twice that.
    const heightOf = (selector: string): Promise<number> =>
      page
        .locator(selector)
        .first()
        .evaluate((element) => element.getBoundingClientRect().height);

    expect(await heightOf('[data-testid="size-tile"] .reading')).toBeCloseTo(
      await heightOf('app-calculator-tile .reading'),
      0,
    );
  });

  test('opens its own Method from the CTA', async ({ page }) => {
    await page.goto('/tabs/calculator/intermediate');
    await waitForAppReady(page);

    await page.locator('app-intermediate-form .calculator-cta').click();

    await expect(page).toHaveURL(/\/tabs\/calculator\/method\/intermediate$/);
    await expect(page.locator('app-method')).toBeVisible();
  });
});
