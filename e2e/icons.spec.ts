import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { seedDemoPreferences, waitForAppReady } from './fixtures';

/**
 * One invariant, checked on every screen that draws icons: an icon occupies
 * exactly the box it draws, and sits at the centre of the container holding
 * it. The defect it guards against is only observable once a real browser has
 * laid the page out — it came from the text line an icon used to create around
 * itself (#106) — so it is stated here rather than in a unit test.
 *
 * The assertions read the rendered geometry and name no CSS property: the way
 * that blank is removed can change without this spec being rewritten. Only the
 * selector below ties it to the icon library in use.
 */
const ICON = 'i-lucide';

const SCREENS = [
  {
    name: 'Expert',
    path: '/tabs/calculator/expert',
    anchor: 'app-expert-page',
  },
  {
    name: 'Guided',
    path: '/tabs/calculator/guided',
    anchor: 'app-calculator-guided-page',
  },
  {
    name: 'Intermediate',
    path: '/tabs/calculator/intermediate',
    anchor: 'app-calculator-intermediate-page',
  },
  {
    name: 'Method',
    path: '/tabs/calculator/method/expert',
    anchor: 'app-method',
  },
  { name: 'Recipes', path: '/tabs/recipes', anchor: 'app-recipes-page' },
  { name: 'Doughs', path: '/tabs/doughs', anchor: 'app-doughs-page' },
] as const;

// Half a pixel: below it the eye sees nothing, above it the icon reads as
// hanging off its centre.
const TOLERANCE = 0.5;

type Box = {
  width: number;
  height: number;
  centreX: number;
  centreY: number;
};

type IconMeasure = {
  /** Where the icon sits, as a failure message can name it. */
  label: string;
  inTabBar: boolean;
  /** The room the icon takes on the screen. */
  box: Box;
  /** The drawing itself. */
  image: Box;
  /** The badge holding the icon, on the screens that draw one. */
  badge: Box | null;
};

/** Measures every icon rendered inside `within`, drawing included. */
async function measureIcons(
  page: Page,
  within = 'body',
): Promise<IconMeasure[]> {
  return page.evaluate(
    ({ selector, within }) => {
      const boxOf = (element: Element): Box => {
        const { width, height, left, right, top, bottom } =
          element.getBoundingClientRect();
        return {
          width,
          height,
          centreX: (left + right) / 2,
          centreY: (top + bottom) / 2,
        };
      };

      // Two levels of ancestry are enough to tell the badge of a Method step
      // from a tab button when a failure message is read.
      const labelOf = (host: Element, index: number) => {
        const parts: string[] = [];
        for (
          let node = host.parentElement;
          node && parts.length < 2;
          node = node.parentElement
        ) {
          const tag = node.tagName.toLowerCase();
          if (tag.includes('-')) parts.unshift(tag);
          else if (node.classList.length)
            parts.unshift(`.${node.classList[0]}`);
        }
        return [...parts, `icon #${index + 1}`].join(' > ');
      };

      const root = document.querySelector(within);
      const measured: IconMeasure[] = [];
      root?.querySelectorAll(selector).forEach((host, index) => {
        const drawing = host.querySelector('svg');
        if (!drawing) return;

        const image = boxOf(drawing);
        // An icon that was never laid out has nothing to say about centring.
        if (!image.width || !image.height) return;

        const badge = host.closest('.icon');
        measured.push({
          label: labelOf(host, index),
          inTabBar: Boolean(host.closest('ion-tab-bar')),
          box: boxOf(host),
          image,
          badge: badge ? boxOf(badge) : null,
        });
      });

      return measured;
    },
    { selector: ICON, within },
  );
}

const size = ({ width, height }: Box) =>
  `${width.toFixed(1)}×${height.toFixed(1)}`;

/** Icons taking up more room than they draw, one line each. */
function blankAround(icons: IconMeasure[]): string[] {
  return icons
    .filter(
      ({ box, image }) =>
        Math.abs(box.width - image.width) > TOLERANCE ||
        Math.abs(box.height - image.height) > TOLERANCE,
    )
    .map(
      ({ label, box, image }) =>
        `${label}: draws ${size(image)} but takes ${size(box)}`,
    );
}

/** Icons hanging off the centre of their badge, one line each. */
function offCentre(icons: IconMeasure[]): string[] {
  return icons
    .flatMap((icon) => (icon.badge ? [{ ...icon, badge: icon.badge }] : []))
    .map((icon) => ({
      label: icon.label,
      across: icon.image.centreX - icon.badge.centreX,
      down: icon.image.centreY - icon.badge.centreY,
    }))
    .filter(
      ({ across, down }) =>
        Math.abs(across) > TOLERANCE || Math.abs(down) > TOLERANCE,
    )
    .map(
      ({ label, across, down }) =>
        `${label}: off the centre of its badge by ` +
        `${across.toFixed(1)}px across, ${down.toFixed(1)}px down`,
    );
}

test.describe('Icons', () => {
  test.beforeEach(async ({ context }) => {
    await seedDemoPreferences(context, 'en');
  });

  for (const screen of SCREENS) {
    test(`every icon of the ${screen.name} screen fills its own box`, async ({
      page,
    }) => {
      await page.goto(screen.path);
      await waitForAppReady(page);
      await expect(page.locator(screen.anchor)).toBeVisible();

      const icons = await measureIcons(page);

      // The tab bar draws icons on every screen; without this the assertion
      // below would pass on a screen that rendered none of its own.
      expect(
        icons.filter((icon) => !icon.inTabBar),
        `the ${screen.name} screen draws icons of its own`,
      ).not.toEqual([]);
      expect(
        blankAround(icons),
        `no icon of the ${screen.name} screen carries blank space around its drawing`,
      ).toEqual([]);
    });
  }

  test('the empty Doughs screen fills the box of its large icon', async ({
    context,
    page,
  }) => {
    // Runs after the demo seeding, so it wins: no saved dough, empty screen.
    await context.addInitScript(() =>
      localStorage.setItem(
        '3:calculator:doughs',
        JSON.stringify({ value: [], expiresAt: null }),
      ),
    );
    await page.goto('/tabs/doughs');
    await waitForAppReady(page);
    await expect(page.locator('.app-empty-state')).toBeVisible();

    const icons = await measureIcons(page, '.app-empty-state');

    expect(icons.length, 'the empty screen draws its large icon').toBe(1);
    expect(
      blankAround(icons),
      'the large icon of an empty screen carries no blank space around its drawing',
    ).toEqual([]);
  });

  test('every Method step sits its icon at the centre of its badge', async ({
    page,
  }) => {
    await page.goto('/tabs/calculator/method/expert');
    await waitForAppReady(page);
    await expect(page.locator('app-method .step').first()).toBeVisible();

    const icons = await measureIcons(page, 'app-method');
    const inBadges = icons.filter((icon) => icon.badge);

    expect(inBadges, 'the Method draws a badge per step').not.toEqual([]);
    expect(
      offCentre(inBadges),
      'every step icon is centred in its badge',
    ).toEqual([]);
  });
});
