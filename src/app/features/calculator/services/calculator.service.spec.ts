import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DEFAULT_DOUGH_CONSTANTS } from '../dough.constants';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import type { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { OUTPUT_FIELDS, readField } from './processors/output-field';
import { CalculatorService } from './calculator.service';

/**
 * The engine through its own interface: an input in, a complete output out.
 * Its steps are seams behind that interface — which one computes what is not
 * the subject here, and no spec below names a processor.
 */
describe('CalculatorService', () => {
  let engine: CalculatorService;

  /** Four 250 g Neapolitan balls at 65 %, resting a day at ambient. */
  const DIRECT: ICalculatorInput = {
    nbPizzas: 4,
    doughType: DoughType.DIRECT,
    yeastType: YeastType.DRY_INSTANT,
    hydrationRatio: 0.65,
    temperature: 20,
    poolishRatio: null,
    globalRestTime: 24,
    rtRestTime: null,
    coldRestTime: null,
    flourStrength: 300,
    saltRatio: 0.028,
    honeyRatio: 0.004,
    pizzaWeight: 250,
    pizzaType: PizzaType.NEAPOLITAN,
    oliveOilRatio: 0,
  };

  const POOLISH: ICalculatorInput = {
    ...DIRECT,
    doughType: DoughType.POOLISH,
    poolishRatio: 0.4,
  };

  const resultOf = (overrides: Partial<ICalculatorInput> = {}) =>
    engine.process({ ...DIRECT, ...overrides });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: new FakePrefsStorage() }],
    });
    engine = TestBed.inject(CalculatorService);
  });

  describe('the output it promises', () => {
    it('fills every field of it', () => {
      const values = [resultOf(), engine.process(POOLISH)];

      for (const result of values) {
        for (const field of OUTPUT_FIELDS) {
          expect(readField(asRecord(result), field))
            .withContext(field)
            .toEqual(jasmine.any(Number));
        }
      }
    });

    it('splits the flour and the water the balls weigh', () => {
      const result = resultOf();

      expect(result.pizzaBalls.weight).toBe(250);
      expect(result.total.flour).toBeCloseTo(1000 / 1.65, 6);
      expect(result.total.water).toBeCloseTo(1000 - 1000 / 1.65, 6);
      // The dough is the whole batch when nothing ferments on the side.
      expect(result.dough.flour).toBeCloseTo(result.total.flour, 6);
      expect(result.dough.water).toBeCloseTo(result.total.water, 6);
      expect(result.poolish.flour).toBe(0);
      expect(result.poolish.water).toBe(0);
    });

    it('weighs the simple ingredients against the total flour', () => {
      const result = resultOf();

      expect(result.total.salt).toBeCloseTo(0.028 * result.total.flour, 6);
      expect(result.total.honey).toBeCloseTo(0.004 * result.total.flour, 6);
      expect(result.total.oliveOil).toBe(0);
      expect(result.dough.salt).toBeCloseTo(result.total.salt, 6);
      expect(result.dough.honey).toBeCloseTo(result.total.honey, 6);
    });

    it('lays out the rest times the dough asks for', () => {
      const result = resultOf();

      // A day of rest, all of it at ambient for a direct dough.
      expect(result.dough.rtRestTime).toBe(24);
      expect(result.dough.coldRestTime).toBe(0);
      expect(result.dough.prepTime).toBe(25);
      expect(result.poolish.prepTime).toBe(0);
      // Balling adds its own rest, and the total carries both.
      expect(result.pizzaBalls.rtRestTime).toBeCloseTo(3.2, 6);
      expect(result.pizzaBalls.prepTime).toBeCloseTo(3.2, 6);
      expect(result.total.rtRestTime).toBeCloseTo(27.2, 6);
      expect(result.total.prepTime).toBeCloseTo(28.2, 6);
    });

    it('rests the balls less as the room gets warmer', () => {
      expect(resultOf({ temperature: 25 }).pizzaBalls.rtRestTime).toBeLessThan(
        resultOf({ temperature: 19 }).pizzaBalls.rtRestTime,
      );
    });
  });

  describe('what a `null` asks it to derive', () => {
    it('derives the hydration from the flour and the style', () => {
      expect(
        resultOf({ hydrationRatio: null, flourStrength: 270 }).hydrationRatio,
      ).toBeCloseTo(0.607, 6);
    });

    it('derives the ball weight from the style', () => {
      expect(resultOf({ pizzaWeight: null }).pizzaBalls.weight).toBe(250);
      expect(
        resultOf({ pizzaWeight: null, pizzaType: PizzaType.ROMAN }).pizzaBalls
          .weight,
      ).toBe(180);
    });

    it('derives the olive oil from the style', () => {
      const roman = resultOf({
        oliveOilRatio: null,
        pizzaType: PizzaType.ROMAN,
      });

      expect(roman.total.oliveOil).toBeCloseTo(0.016 * roman.total.flour, 6);
      expect(
        resultOf({ oliveOilRatio: null, pizzaType: PizzaType.NEAPOLITAN }).total
          .oliveOil,
      ).toBe(0);
    });

    it('splits a total rest into ambient and cold', () => {
      const result = resultOf({ globalRestTime: 48 });

      expect(result.dough.rtRestTime).toBe(24);
      expect(result.dough.coldRestTime).toBe(24);
    });

    it('brings a ball weight the style does not allow back to its bound', () => {
      expect(
        resultOf({ pizzaWeight: 400, pizzaType: PizzaType.ROMAN }).pizzaBalls
          .weight,
      ).toBe(210);
    });
  });

  describe('a poolish', () => {
    it('takes its share of the flour and the water from the dough', () => {
      const result = engine.process(POOLISH);

      // 40 % of the batch, half flour and half water.
      expect(result.poolish.flour).toBe(200);
      expect(result.poolish.water).toBe(200);
      expect(result.dough.flour).toBeCloseTo(result.total.flour - 200, 6);
      expect(result.dough.water).toBeCloseTo(result.total.water - 200, 6);
    });

    it('takes the honey and leaves the salt to the dough', () => {
      const result = engine.process(POOLISH);

      expect(result.poolish.honey).toBeCloseTo(result.total.honey, 6);
      expect(result.dough.honey).toBe(0);
      expect(result.poolish.salt).toBe(0);
      expect(result.poolish.oliveOil).toBe(0);
      expect(result.dough.salt).toBeCloseTo(result.total.salt, 6);
    });

    it('ferments on the side while the dough waits', () => {
      const result = engine.process(POOLISH);

      expect(result.poolish.rtRestTime).toBe(1);
      expect(result.poolish.coldRestTime).toBe(23);
      expect(result.poolish.prepTime).toBe(26);
      expect(result.dough.rtRestTime).toBe(0);
      expect(result.dough.coldRestTime).toBe(0);
      expect(result.dough.prepTime).toBe(1);
      expect(result.total.prepTime).toBeCloseTo(30.2, 6);
    });
  });

  describe('the yeast', () => {
    const { minimumPercentage, maximumPercentage, freshCoef } =
      DEFAULT_DOUGH_CONSTANTS.yeast;

    it('goes where the fermentation happens', () => {
      const direct = resultOf();
      const poolish = engine.process(POOLISH);

      expect(direct.dough.yeast).toBe(direct.total.yeast);
      expect(direct.poolish.yeast).toBe(0);
      expect(poolish.poolish.yeast).toBe(poolish.total.yeast);
      expect(poolish.dough.yeast).toBe(0);
    });

    it('stays inside the baker percentages the model allows', () => {
      const result = resultOf();
      const flour = result.dough.flour;

      expect(result.total.yeast).toBeGreaterThanOrEqual(
        (minimumPercentage / 100) * flour,
      );
      expect(result.total.yeast).toBeLessThanOrEqual(
        (maximumPercentage / 100) * flour,
      );
    });

    it('asks for less of it the longer and the warmer it rests', () => {
      const reference = resultOf().total.yeast;

      expect(resultOf({ globalRestTime: 48 }).total.yeast).toBeLessThan(
        reference,
      );
      expect(resultOf({ temperature: 25 }).total.yeast).toBeLessThan(reference);
    });

    it('converts the weight to the yeast the user actually has', () => {
      expect(resultOf({ yeastType: YeastType.FRESH }).total.yeast).toBeCloseTo(
        freshCoef * resultOf({ yeastType: YeastType.DRY_INSTANT }).total.yeast,
        6,
      );
    });
  });

  /** The output as the fields address it. */
  function asRecord(result: ICalculatorOutput): Record<string, unknown> {
    return result as unknown as Record<string, unknown>;
  }
});
