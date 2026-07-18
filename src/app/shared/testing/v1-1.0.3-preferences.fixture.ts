/**
 * Raw localStorage snapshot using the exact envelope, cache namespace and
 * preference keys written by Pizza Maker 1.0.3 (commit 8c3bc31).
 *
 * Values are deliberately representative of an installed user who used all
 * three calculator modes, named saves, a removed locale/theme and the settings
 * that disappeared in v2. Keeping the raw serialized form makes the migration
 * QA cross the real PrefsStorage boundary instead of only exercising a fake.
 */
export const V1_0_3_LOCAL_STORAGE_FIXTURE: Readonly<Record<string, string>> = {
  '3:theme': stored('dark'),
  '3:public-theme': stored('napolitain'),
  '3:secret-theme': stored('konami'),
  '3:discovered-themes': stored(['konami']),
  '3:locale:current': stored('de-DE'),
  '3:keepAwake': stored(true),
  '3:calculator:config': stored({
    yeast: { dryActive: 0.006 },
  }),
  '3:calculator:complex': stored(
    input({
      nbPizzas: 8,
      doughType: 'poolish',
      hydrationRatio: 0.67,
      poolishRatio: 0.45,
      coldRestTime: 24,
      rtRestTime: 4,
      globalRestTime: 28,
    }),
  ),
  '3:calculator:assist': stored(
    input({
      nbPizzas: 4,
      hydrationRatio: 0.64,
      globalRestTime: 24,
      rtRestTime: 24,
    }),
  ),
  '3:calculator:simple': stored(
    input({
      nbPizzas: 2,
      hydrationRatio: 0.62,
      globalRestTime: 12,
      rtRestTime: 12,
    }),
  ),
  '3:calculator:complex:states': stored([
    {
      name: 'Poolish du samedi',
      input: input({
        nbPizzas: 8,
        doughType: 'poolish',
        hydrationRatio: 0.67,
        poolishRatio: 0.45,
        coldRestTime: 24,
        rtRestTime: 4,
        globalRestTime: 28,
      }),
    },
  ]),
  '3:calculator:assist:states': stored([
    {
      name: 'Pâte guidée',
      input: input({ nbPizzas: 4, hydrationRatio: 0.64 }),
    },
  ]),
  '3:calculator:simple:states': stored([
    {
      name: 'Express',
      input: input({
        nbPizzas: 2,
        hydrationRatio: 0.62,
        globalRestTime: 12,
        rtRestTime: 12,
      }),
    },
  ]),
  '3:calculator:settings:complex': stored({
    hydrationRatio: { auto: false, visible: true },
    honeyRatio: { auto: true, visible: false },
  }),
  '3:calculator:settings:assist': stored({
    doughType: { auto: false, visible: true },
  }),
  '3:calculator:settings:simple': stored({
    saltRatio: { auto: true, visible: false },
  }),
  '3:assistant:data': stored({ pizzaType: 'neapolitan', nbPizzas: 4 }),
  '3:assistant:currentStepIndex': stored(3),
};

function stored(value: unknown): string {
  return JSON.stringify({ value, expiresAt: null });
}

function input(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    nbPizzas: 5,
    doughType: 'direct',
    yeastType: 'dry_active',
    hydrationRatio: 0.62,
    temperature: 20,
    poolishRatio: 0.4,
    globalRestTime: 24,
    rtRestTime: 16,
    coldRestTime: 0,
    flourStrength: 270,
    saltRatio: 0.028,
    honeyRatio: 0.004,
    pizzaWeight: 250,
    pizzaType: 'neapolitan',
    oliveOilRatio: 0,
    ...overrides,
  };
}
