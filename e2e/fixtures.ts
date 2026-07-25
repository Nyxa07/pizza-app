import type { BrowserContext, Page } from '@playwright/test';

/**
 * Shared helpers for e2e specs: seed the app with deterministic demo data
 * (same localStorage shape as scripts/capture-store-screenshots.mjs) and
 * wait for the Ionic shell to be fully rendered.
 */

export type DemoLanguage = 'en' | 'fr';

export const demoInput = {
  nbPizzas: 6,
  doughType: 'poolish',
  yeastType: 'dry_active',
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
  pizzaType: 'neapolitan',
  oliveOilRatio: 0,
} as const;

export function demoDoughs(language: DemoLanguage) {
  const names =
    language === 'fr'
      ? ['Poolish du samedi', 'Margherita express']
      : ['Saturday poolish', 'Quick Margherita'];
  return [
    {
      id: 'store-poolish',
      name: names[0],
      input: demoInput,
      createdAt: '2026-07-18T18:00:00.000Z',
      updatedAt: '2026-07-18T18:00:00.000Z',
    },
    {
      id: 'store-express',
      name: names[1],
      input: {
        ...demoInput,
        nbPizzas: 4,
        doughType: 'direct',
        hydrationRatio: 0.62,
        globalRestTime: 8,
        rtRestTime: 8,
        coldRestTime: 0,
      },
      createdAt: '2026-07-17T18:00:00.000Z',
      updatedAt: '2026-07-17T18:00:00.000Z',
    },
  ];
}

/**
 * Seeds preferences before any app script runs, on every navigation of the
 * given browser context. Call this in `test.beforeEach`.
 */
export async function seedDemoPreferences(
  context: BrowserContext,
  language: DemoLanguage = 'en',
): Promise<void> {
  await context.addInitScript(
    ({ language, doughs, input }) => {
      try {
        const stored = (value: unknown) =>
          JSON.stringify({ value, expiresAt: null });
        localStorage.clear();
        localStorage.setItem('3:schema-version', stored(6));
        localStorage.setItem('3:locale:current', stored(language));
        localStorage.setItem('3:appearance', stored('light'));
        localStorage.setItem('3:keepAwake', stored(false));
        localStorage.setItem('3:calculator:draft', stored(input));
        localStorage.setItem('3:calculator:doughs', stored(doughs));
      } catch {
        // Opaque origins (about:blank) expose no usable localStorage; ignore.
      }
    },
    { language, doughs: demoDoughs(language), input: demoInput },
  );
}

/** Waits until the Ionic app has booted and rendered meaningful content. */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const app = document.querySelector('ion-app');
    const content = document.body?.innerText?.trim() ?? '';
    return document.readyState === 'complete' && app && content.length > 40;
  });
}
