import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import {
  DIRECT_INPUT,
  POOLISH_INPUT,
  inputWith,
} from '../testing/calculator-input.fixture';
import { FixedMethodClock } from '../testing/fixed-method-clock';
import { CalculatorMethods } from './calculator-methods.service';
import { MethodClock } from './method-clock';

const STEPS = 'calculator.method.steps.';

/**
 * The Method module through its own interface: an input in, what a screen
 * renders out. The engine, the step definitions and the clock are seams
 * behind it — no spec below fabricates an engine output or passes a time.
 */
describe('CalculatorMethods', () => {
  let methods: CalculatorMethods;
  // A Tuesday evening, deliberately off the quarter-hour grid.
  const NOW = new Date(2026, 6, 14, 20, 53);

  const configure = (now: Date = NOW): void => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
        { provide: MethodClock, useValue: new FixedMethodClock(now) },
      ],
    });
    methods = TestBed.inject(CalculatorMethods);
  };

  const methodOf = (input: ICalculatorInput) => {
    const method = methods.methodFor(input);
    expect(method).withContext('a method for a filled-in input').toBeTruthy();
    return method!;
  };

  const stepTitled = (input: ICalculatorInput, key: string) =>
    methodOf(input).steps.find((step) => step.title === STEPS + key);

  const datedSteps = (input: ICalculatorInput) =>
    methodOf(input)
      .steps.filter((step) => step.at)
      .map((step) => [step.title, step.at]);

  beforeEach(() => configure());

  describe('the full method of a poolish dough through the fridge', () => {
    it('weighs in the two parts, yeast to the centigram, zero grams skipped', () => {
      const { sections } = methodOf(POOLISH_INPUT);

      expect(sections.length).toBe(2);
      expect(sections[0].title).toBe('calculator.method.titles.poolish');
      // 40 % of 772 g of flour, at 100 % hydration, with its pinch of yeast.
      expect(sections[0].ingredients).toEqual([
        { key: 'flour', grams: 250 },
        { key: 'water', grams: 250 },
        { key: 'yeast', grams: 0.1 },
        { key: 'honey', grams: 3 },
      ]);
      expect(sections[1].title).toBe('calculator.method.titles.poolishDough');
      // No yeast, no honey: the poolish already carries both.
      expect(sections[1].ingredients).toEqual([
        { key: 'flour', grams: 522 },
        { key: 'water', grams: 228 },
        { key: 'salt', grams: 22 },
      ]);
    });

    it('runs the full method: 4 poolish + 11 dough steps + the bake', () => {
      expect(methodOf(POOLISH_INPUT).steps.length).toBe(16);
    });

    it('dates the milestones on the engine timings, quarter-hour grid', () => {
      expect(datedSteps(POOLISH_INPUT)).toEqual([
        // 20:53 ceiled to the grid.
        [STEPS + 'mixIngredients.title', new Date(2026, 6, 14, 21, 0)],
        // Into the fridge after 1 h of handling + the 16 h ambient asked for.
        [STEPS + 'restCold.title', new Date(2026, 6, 15, 14, 0)],
        // Out of the fridge 1 h before the frasage (+8 h cold).
        [STEPS + 'takeOutPoolish.title', new Date(2026, 6, 15, 22, 0)],
        // The frasage lands exactly on the poolish's own prep time.
        [STEPS + 'addWaterSalt.title', new Date(2026, 6, 15, 23, 0)],
        // Balling one hour of dough handling after the frasage.
        [STEPS + 'formBalls.title', new Date(2026, 6, 16, 0, 0)],
        // The bake closes the run, on the total prep time.
        [STEPS + 'bake.title', new Date(2026, 6, 16, 3, 15)],
      ]);
    });

    it('starts and finishes on the announced clock', () => {
      const method = methodOf(POOLISH_INPUT);

      expect(method.startAt).toEqual(new Date(2026, 6, 14, 21, 0));
      expect(method.readyAt).toEqual(new Date(2026, 6, 16, 3, 15));
    });

    it('attaches each frasage quantity to the step that incorporates it', () => {
      const frasage = stepTitled(POOLISH_INPUT, 'addWaterSalt.title');
      const flour = stepTitled(POOLISH_INPUT, 'addFlourPoolishDough.title');

      expect(frasage?.ingredients).toEqual([
        { key: 'water', grams: 228 },
        { key: 'salt', grams: 22 },
      ]);
      expect(frasage?.variables['hasSalt']).toBeTrue();
      expect(frasage?.variables['hasOliveOil']).toBeFalse();
      expect(flour?.ingredients).toEqual([{ key: 'flour', grams: 522 }]);
    });

    it('incorporates optional olive oil during the poolish frasage', () => {
      const oiled = inputWith({ oliveOilRatio: 0.02 });
      const frasage = stepTitled(oiled, 'addWaterSalt.title');

      expect(frasage?.variables['hasOliveOil']).toBeTrue();
      expect(frasage?.ingredients.map(({ key }) => key)).toEqual([
        'water',
        'salt',
        'oliveOil',
      ]);
    });

    it('gives the poolish mix its quantities and the rests it will run', () => {
      const mix = methodOf(POOLISH_INPUT).steps[0];

      // The flour of the poolish is weighed in the section, not narrated here.
      expect(mix.ingredients).toEqual([
        { key: 'water', grams: 250 },
        { key: 'yeast', grams: 0.1 },
        { key: 'honey', grams: 3 },
      ]);
      expect(mix.variables['hasHoney']).toBeTrue();
      expect(mix.variables['rtRestTime']).toBe(16);
      expect(mix.variables['coldRestTime']).toBe(8);
    });

    it('rounds the balls rest for the narration and leaves it undated', () => {
      const finalRest = stepTitled(POOLISH_INPUT, 'finalRest.title');

      // The engine rests the balls 3.2 h; a method says « 3 h ».
      expect(finalRest?.variables['rtRestTime']).toBe(3);
      expect(finalRest?.at).toBeNull();
    });

    it('expands helpers, and leaves none on the helperless steps', () => {
      const knead = stepTitled(POOLISH_INPUT, 'knead.title');
      const restOneHour = stepTitled(POOLISH_INPUT, 'restOneHour.title');

      expect(knead?.helper).toEqual({
        title: STEPS + 'knead.helper.title',
        descriptions: [
          STEPS + 'knead.helper.descriptions.0',
          STEPS + 'knead.helper.descriptions.1',
          STEPS + 'knead.helper.descriptions.2',
        ],
      });
      expect(restOneHour?.helper).toBeNull();
    });

    it('never rounds a tiny yeast down to nothing', () => {
      // 0.1 g of dry yeast for 250 g of poolish flour — the engine's own
      // figure, and the one a weigh-in to the gram would narrate as absent.
      // The centigram floor itself is covered in `ingredient-grams.spec`.
      expect(methodOf(POOLISH_INPUT).sections[0].ingredients).toContain({
        key: 'yeast',
        grams: 0.1,
      });
    });
  });

  describe('the full method of a poolish kept at room temperature', () => {
    const warm = inputWith({ coldRestTime: 0 });

    it('hides the fridge steps and re-dates the frasage', () => {
      const method = methodOf(warm);
      const titles = method.steps.map((step) => step.title);

      expect(method.steps.length).toBe(14);
      expect(titles).not.toContain(STEPS + 'restCold.title');
      expect(titles).not.toContain(STEPS + 'takeOutPoolish.title');
      // 21:00 + 1 h of handling + 16 h ambient, and no fridge in between.
      expect(stepTitled(warm, 'addWaterSalt.title')?.at).toEqual(
        new Date(2026, 6, 15, 14, 0),
      );
    });
  });

  describe('the full method of a direct dough', () => {
    it('weighs in a single part with every non-zero ingredient', () => {
      const { sections } = methodOf(DIRECT_INPUT);

      expect(sections.length).toBe(1);
      expect(sections[0].title).toBe('calculator.method.titles.directDough');
      // Olive oil is 0 g in this dough and never reaches the weigh-in.
      expect(sections[0].ingredients).toEqual([
        { key: 'flour', grams: 772 },
        { key: 'water', grams: 478 },
        { key: 'yeast', grams: 1.99 },
        { key: 'salt', grams: 22 },
        { key: 'honey', grams: 3 },
      ]);
    });

    it('runs 10 visible steps plus the bake, no fridge trip', () => {
      const method = methodOf(DIRECT_INPUT);
      const titles = method.steps.map((step) => step.title);

      expect(method.steps.length).toBe(11);
      expect(titles).not.toContain(STEPS + 'restCold.title');
      expect(titles).not.toContain(STEPS + 'takeOutDough.title');
    });

    it('dates the mix, the balling and the bake on the engine timings', () => {
      expect(datedSteps(DIRECT_INPUT)).toEqual([
        [STEPS + 'mixIngredients.title', new Date(2026, 6, 14, 21, 0)],
        // 1 h of handling + the 8 h bulk rest asked for.
        [STEPS + 'formBalls.title', new Date(2026, 6, 15, 6, 0)],
        [STEPS + 'bake.title', new Date(2026, 6, 15, 7, 15)],
      ]);
    });

    it('narrates ingredient quantities on their actual incorporation step', () => {
      const mix = stepTitled(DIRECT_INPUT, 'mixIngredients.title');
      const flour = stepTitled(DIRECT_INPUT, 'addFlourSaltOil.title');

      expect(mix?.ingredients).toEqual([
        { key: 'water', grams: 478 },
        { key: 'yeast', grams: 1.99 },
        { key: 'honey', grams: 3 },
      ]);
      expect(flour?.ingredients).toEqual([
        { key: 'flour', grams: 772 },
        { key: 'salt', grams: 22 },
      ]);
    });
  });

  describe('the full method of a direct dough through the fridge', () => {
    const cold: ICalculatorInput = { ...DIRECT_INPUT, coldRestTime: 24 };

    it('dates the fridge trips around the cold rest', () => {
      expect(methodOf(cold).steps.length).toBe(13);
      expect(datedSteps(cold)).toEqual([
        [STEPS + 'mixIngredients.title', new Date(2026, 6, 14, 21, 0)],
        // Into the fridge after 1 h of handling + 8 h ambient.
        [STEPS + 'restCold.title', new Date(2026, 6, 15, 6, 0)],
        // Out of the fridge 1 h before balling (+24 h cold).
        [STEPS + 'takeOutDough.title', new Date(2026, 6, 16, 6, 0)],
        [STEPS + 'formBalls.title', new Date(2026, 6, 16, 7, 0)],
        [STEPS + 'bake.title', new Date(2026, 6, 16, 10, 15)],
      ]);
    });
  });

  describe('the aperçu of that same method', () => {
    it('narrates the poolish mix then the frasage, honey in the poolish', () => {
      const { steps } = methods.previewFor(POOLISH_INPUT);

      expect(steps[0].bodyKey).toBe(
        'calculator.shared.method.steps.poolishMix',
      );
      expect(steps[0].at).toEqual(new Date(2026, 6, 14, 21, 0));
      expect(steps[0].ingredients).toEqual([
        { key: 'flour', grams: 250 },
        { key: 'water', grams: 250 },
        { key: 'yeast', grams: 0.1 },
        { key: 'honey', grams: 3 },
      ]);

      expect(steps[1].bodyKey).toBe(
        'calculator.shared.method.steps.poolishKnead',
      );
      // Honey already went into the poolish; olive oil is 0 g. Neither
      // belongs in the frasage narration.
      expect(steps[1].ingredients).toEqual([
        { key: 'flour', grams: 522 },
        { key: 'water', grams: 228 },
        { key: 'salt', grams: 22 },
      ]);
    });

    it('narrates the single mix then the balling of a direct dough', () => {
      const { steps } = methods.previewFor(DIRECT_INPUT);

      expect(steps[0].bodyKey).toBe('calculator.shared.method.steps.directMix');
      expect(steps[0].ingredients.map(({ key }) => key)).toEqual([
        'flour',
        'water',
        'yeast',
        'salt',
        'honey',
      ]);

      expect(steps[1].bodyKey).toBe(
        'calculator.shared.method.steps.directBalls',
      );
      expect(steps[1].ingredients).toEqual([]);
      expect(steps[1].bodyParams).toEqual({ count: 5, weight: 250 });
    });

    it('keeps a start time already on the grid untouched', () => {
      configure(new Date(2026, 6, 14, 21, 0, 0, 0));

      expect(methods.previewFor(DIRECT_INPUT).steps[0].at).toEqual(
        new Date(2026, 6, 14, 21, 0),
      );
    });
  });

  /**
   * What the single interface buys: the aperçu is a reading of the very run
   * the Method screen renders, so the two cannot drift apart — not on the
   * grams, not on the number of steps promised by the « voir les N étapes »
   * of the card, and not on the clock. That last one only holds because the
   * app's clock holds still between the two readings, which is the subject
   * of `method-clock.spec.ts`; here it is pinned outright.
   */
  describe('the aperçu and the full method, on the same run', () => {
    for (const [label, input] of [
      ['a poolish dough', POOLISH_INPUT],
      ['a direct dough', DIRECT_INPUT],
      ['a poolish at room temperature', inputWith({ coldRestTime: 0 })],
      [
        'a direct dough through the fridge',
        { ...DIRECT_INPUT, coldRestTime: 24 },
      ],
    ] as const) {
      it(`tell the same times and the same run for ${label}`, () => {
        const method = methodOf(input);
        const preview = methods.previewFor(input);

        expect(preview.steps[0].at).toEqual(method.startAt);
        expect(preview.readyAt).toEqual(method.readyAt);
        expect(preview.totalSteps).toBe(method.steps.length);
      });
    }
  });

  describe('an input with nothing to narrate', () => {
    it('has no method — the screen shows a way out, not an empty run', () => {
      // Not a ball weight of zero: the engine re-seats that one inside the
      // style. Zero pizzas is the one input that weighs out no flour at all.
      expect(methods.methodFor(inputWith({ nbPizzas: 0 }))).toBeNull();
      expect(methods.methodFor(inputWith({ pizzaWeight: 0 }))).not.toBeNull();
    });
  });
});
