import { TestBed } from '@angular/core/testing';

import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import type { Dough } from 'src/app/features/doughs/interfaces/dough.interface';
import { V1_0_3_LOCAL_STORAGE_FIXTURE } from 'src/app/shared/testing/v1-1.0.3-preferences.fixture';

import { MigrationService } from './migration.service';
import { PrefsStorage } from './prefs-storage.service';

describe('MigrationService 1.0.3 integration', () => {
  let migration: MigrationService;
  let prefs: PrefsStorage;

  const v2Keys = [
    '3:schema-version',
    '3:calculator:draft',
    '3:calculator:draft:expert',
    '3:calculator:draft:guided',
    '3:calculator:doughs',
  ];
  const fixtureKeys = Object.keys(V1_0_3_LOCAL_STORAGE_FIXTURE);

  beforeEach(() => {
    removeFixture();
    for (const [key, value] of Object.entries(V1_0_3_LOCAL_STORAGE_FIXTURE)) {
      localStorage.setItem(key, value);
    }

    TestBed.configureTestingModule({});
    migration = TestBed.inject(MigrationService);
    prefs = TestBed.inject(PrefsStorage);
  });

  afterEach(removeFixture);

  it('migrates an authentic 1.0.3 snapshot without loss or stale v1 keys', () => {
    expect(() => migration.run()).not.toThrow();

    const draft = prefs.get<ICalculatorInput>('calculator:draft:expert');
    expect(draft).toEqual(
      jasmine.objectContaining({
        nbPizzas: 8,
        doughType: 'poolish',
        hydrationRatio: 0.67,
        coldRestTime: 24,
      }),
    );

    const doughs = prefs.get<Dough[]>('calculator:doughs');
    expect(doughs?.map(({ name }) => name)).toEqual([
      'Poolish du samedi',
      'Pâte guidée',
      'Express',
    ]);
    expect(doughs?.map(({ input }) => input.nbPizzas)).toEqual([8, 4, 2]);
    expect(new Set(doughs?.map(({ id }) => id)).size).toBe(3);

    expect(prefs.get('locale:current')).toBeNull();
    expect(prefs.get('theme')).toBeNull();
    expect(prefs.get('public-theme')).toBeNull();
    expect(prefs.get('secret-theme')).toBeNull();
    expect(prefs.get('discovered-themes')).toBeNull();
    expect(prefs.get('calculator:settings:complex')).toBeNull();
    expect(prefs.get('calculator:settings:assist')).toBeNull();
    expect(prefs.get('calculator:settings:simple')).toBeNull();
    expect(prefs.get('assistant:data')).toBeNull();
    expect(prefs.get('assistant:currentStepIndex')).toBeNull();

    expect(prefs.get('keepAwake')).toBeTrue();
    expect(prefs.get('calculator:config')).toEqual({
      yeast: { dryActive: 0.006 },
    });
    expect(prefs.get('schema-version')).toBe(7);
    expect(prefs.get('calculator:draft')).toBeNull();
    expect(prefs.get('calculator:draft:guided')).toBeNull();

    const removedV1Keys = fixtureKeys.filter(
      (key) => key !== '3:keepAwake' && key !== '3:calculator:config',
    );
    expect(
      removedV1Keys.every((key) => localStorage.getItem(key) === null),
    ).toBeTrue();
  });

  it('is idempotent after the complete 1.0.3 migration', () => {
    migration.run();
    const firstDraft = prefs.get<ICalculatorInput>('calculator:draft:expert');
    const firstDoughs = prefs.get<Dough[]>('calculator:doughs');

    expect(() => migration.run()).not.toThrow();

    expect(prefs.get('calculator:draft:expert')).toEqual(firstDraft);
    expect(prefs.get('calculator:doughs')).toEqual(firstDoughs);
  });

  function removeFixture(): void {
    [...fixtureKeys, ...v2Keys].forEach((key) => localStorage.removeItem(key));
  }
});
