/**
 * Contrast budget of the semantic token layer (issue #85).
 *
 * The tokens of src/theme/variables.scss are the single source of truth for
 * every color in the app (ADR-0001), so measuring them here covers every
 * screen at once. Ratios are computed from the *resolved* custom properties,
 * which is what the browser actually paints.
 *
 * Thresholds:
 *   - text on a background: 4.5:1 (WCAG 2.1 AA, normal text)
 *   - hairlines/borders: 1.5:1 on every plane they are drawn on — enough to
 *     read an edge without turning it into a rule
 *   - surface separation: 1.1:1, so a card never melts into the page
 */

type Rgb = readonly [number, number, number];

/** The three planes a card, a sheet or a control can sit on. */
const PLANES = ['--bg', '--surface', '--surface-sunken'] as const;

/** Tokens that carry text, and therefore owe AA on every plane. */
const INKS = ['--ink', '--ink-2', '--ink-3', '--accent'] as const;

const SEMANTIC_TOKENS = [
  ...PLANES,
  ...INKS,
  '--hairline',
  '--on-accent',
  '--accent-soft',
] as const;

const ION_COLORS = [
  'primary',
  'secondary',
  'tertiary',
  'success',
  'warning',
  'danger',
  'light',
  'medium',
  'dark',
] as const;

type SemanticToken = (typeof SEMANTIC_TOKENS)[number];
type IonColor = (typeof ION_COLORS)[number];
type IonToken = `--ion-color-${IonColor}` | `--ion-color-${IonColor}-contrast`;

/** Semantic and Ionic tokens read once per appearance. */
type Tokens = Readonly<Record<SemanticToken | IonToken, string>>;

const AA_TEXT = 4.5;
const HAIRLINE_MIN = 1.5;
const SURFACE_SEPARATION = 1.1;

/**
 * Custom properties resolve to whatever variables.scss declared, and the
 * token layer declares nothing but six-digit hex.
 */
function parseColor(value: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!hex) {
    throw new Error(`Unsupported color format: "${value}"`);
  }

  const channels = hex[1];
  return [
    parseInt(channels.slice(0, 2), 16),
    parseInt(channels.slice(2, 4), 16),
    parseInt(channels.slice(4, 6), 16),
  ];
}

/** WCAG 2.1 relative luminance. */
function relativeLuminance(color: Rgb): number {
  const [r, g, b] = color.map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const luminances = [a, b].map((color) =>
    relativeLuminance(parseColor(color)),
  );
  const lighter = Math.max(...luminances);
  const darker = Math.min(...luminances);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Stamp [data-appearance] the way AppearanceService does, then read the
 * resolved tokens off <html>.
 */
function readTokens(appearance: 'light' | 'dark'): Tokens {
  const root = document.documentElement;
  const previous = root.dataset['appearance'];
  root.dataset['appearance'] = appearance;

  const computed = getComputedStyle(root);
  const read = (token: string) => computed.getPropertyValue(token).trim();

  const tokens = {} as Record<SemanticToken | IonToken, string>;
  for (const token of SEMANTIC_TOKENS) {
    tokens[token] = read(token);
  }
  for (const color of ION_COLORS) {
    tokens[`--ion-color-${color}`] = read(`--ion-color-${color}`);
    tokens[`--ion-color-${color}-contrast`] = read(
      `--ion-color-${color}-contrast`,
    );
  }

  if (previous === undefined) {
    delete root.dataset['appearance'];
  } else {
    root.dataset['appearance'] = previous;
  }
  return tokens;
}

describe('Design token contrast', () => {
  describe('dark appearance', () => {
    let tokens: Tokens;

    beforeAll(() => {
      tokens = readTokens('dark');
    });

    for (const plane of PLANES) {
      for (const ink of INKS) {
        it(`renders ${ink} on ${plane} at AA`, () => {
          expect(
            contrastRatio(tokens[ink], tokens[plane]),
          ).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    }

    it('renders --ink on --accent-soft at AA', () => {
      expect(
        contrastRatio(tokens['--ink'], tokens['--accent-soft']),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('renders --on-accent on --accent at AA', () => {
      expect(
        contrastRatio(tokens['--on-accent'], tokens['--accent']),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    });

    for (const color of ION_COLORS) {
      it(`renders ion-color-${color}-contrast on its base at AA`, () => {
        expect(
          contrastRatio(
            tokens[`--ion-color-${color}-contrast`],
            tokens[`--ion-color-${color}`],
          ),
        ).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }

    for (const plane of PLANES) {
      it(`keeps hairlines perceptible on ${plane}`, () => {
        expect(
          contrastRatio(tokens['--hairline'], tokens[plane]),
        ).toBeGreaterThanOrEqual(HAIRLINE_MIN);
      });
    }

    it('separates raised surfaces from the page background', () => {
      expect(
        contrastRatio(tokens['--surface'], tokens['--bg']),
      ).toBeGreaterThanOrEqual(SURFACE_SEPARATION);
    });

    it('separates sunken surfaces from the page background', () => {
      expect(
        contrastRatio(tokens['--surface-sunken'], tokens['--bg']),
      ).toBeGreaterThanOrEqual(SURFACE_SEPARATION);
    });

    it('keeps the elevation scale ordered: sunken < bg < surface', () => {
      const luminance = (token: SemanticToken) =>
        relativeLuminance(parseColor(tokens[token]));

      expect(luminance('--surface-sunken')).toBeLessThan(luminance('--bg'));
      expect(luminance('--bg')).toBeLessThan(luminance('--surface'));
    });
  });

  describe('light appearance', () => {
    // Issue #85 is dark-only. Light already ships below AA on --ink-3 and on
    // --accent over --bg, so the same budget cannot be asserted here; this is
    // a value lock against collateral drift, not a contrast measurement.
    const EXPECTED: Readonly<Record<SemanticToken, string>> = {
      '--bg': '#f6f4f0',
      '--surface': '#ffffff',
      '--surface-sunken': '#efece5',
      '--ink': '#201d1a',
      '--ink-2': '#6f6a62',
      '--ink-3': '#a39d93',
      '--hairline': '#e6e2db',
      '--accent': '#c14e2c',
      '--on-accent': '#ffffff',
      '--accent-soft': '#f6e7e0',
    };

    let tokens: Tokens;

    beforeAll(() => {
      tokens = readTokens('light');
    });

    for (const token of SEMANTIC_TOKENS) {
      it(`leaves ${token} untouched`, () => {
        expect(tokens[token]).toBe(EXPECTED[token]);
      });
    }
  });
});
