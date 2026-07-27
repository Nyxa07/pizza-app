import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';

import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import {
  ICalculatorOutput,
  Quantity,
} from '../interfaces/calculator-output.interface';
import { MethodService } from './method.service';

const STEPS = 'calculator.method.steps.';

const quantity = (overrides: Partial<Quantity> = {}): Quantity => ({
  flour: 0,
  water: 0,
  yeast: 0,
  salt: 0,
  honey: 0,
  oliveOil: 0,
  rtRestTime: 0,
  coldRestTime: 0,
  prepTime: 0,
  ...overrides,
});

const makeInput = (
  overrides: Partial<ICalculatorInput> = {},
): ICalculatorInput => ({
  nbPizzas: 5,
  doughType: DoughType.POOLISH,
  yeastType: YeastType.DRY_ACTIVE,
  hydrationRatio: 0.62,
  temperature: 20,
  poolishRatio: 0.4,
  globalRestTime: null,
  rtRestTime: 16,
  coldRestTime: 8,
  flourStrength: 270,
  saltRatio: 0.028,
  honeyRatio: 0.004,
  pizzaWeight: 250,
  pizzaType: PizzaType.NEAPOLITAN,
  oliveOilRatio: 0,
  ...overrides,
});

// Timings follow the engine: prepTime = 1 h of handling + ambient rest +
// cold rest + 1 h out of the fridge when the cold rest exists.
const makePoolishOutput = (): ICalculatorOutput => ({
  total: quantity({
    flour: 755.3,
    water: 468.1,
    yeast: 0.84,
    salt: 21.4,
    honey: 3.05,
    rtRestTime: 18,
    coldRestTime: 8,
    prepTime: 29,
  }),
  poolish: quantity({
    flour: 302.4,
    water: 302.4,
    yeast: 0.84,
    honey: 3.05,
    rtRestTime: 16,
    coldRestTime: 8,
    prepTime: 26,
  }),
  dough: quantity({
    flour: 452.9,
    water: 165.7,
    salt: 21.4,
    prepTime: 1,
  }),
  pizzaBalls: { weight: 250, rtRestTime: 2, coldRestTime: 0, prepTime: 2 },
  hydrationRatio: 0.62,
});

const makeDirectOutput = (): ICalculatorOutput => ({
  total: quantity({
    flour: 755.3,
    water: 468.1,
    yeast: 2.14,
    salt: 21.4,
    honey: 3.05,
    oliveOil: 12.2,
    rtRestTime: 10,
    coldRestTime: 0,
    prepTime: 11,
  }),
  poolish: quantity(),
  dough: quantity({
    flour: 755.3,
    water: 468.1,
    yeast: 2.14,
    salt: 21.4,
    honey: 3.05,
    oliveOil: 12.2,
    rtRestTime: 8,
    coldRestTime: 0,
    prepTime: 9,
  }),
  pizzaBalls: { weight: 250, rtRestTime: 2, coldRestTime: 0, prepTime: 2 },
  hydrationRatio: 0.62,
});

describe('MethodService', () => {
  let service: MethodService;
  // A Tuesday evening, deliberately off the quarter-hour grid.
  const now = new Date(2026, 6, 14, 20, 53);

  beforeEach(() => {
    service = new MethodService();
  });

  describe('with a poolish dough (cold rest)', () => {
    it('weighs in the two parts, yeast to the centigram, zero grams skipped', () => {
      const method = service.build(makeInput(), makePoolishOutput(), now);

      expect(method.sections.length).toBe(2);
      expect(method.sections[0].title).toBe('calculator.method.titles.poolish');
      expect(method.sections[0].ingredients).toEqual([
        { key: 'flour', grams: 302 },
        { key: 'water', grams: 302 },
        { key: 'yeast', grams: 0.84 },
        { key: 'honey', grams: 3 },
      ]);
      expect(method.sections[1].title).toBe(
        'calculator.method.titles.poolishDough',
      );
      expect(method.sections[1].ingredients).toEqual([
        { key: 'flour', grams: 453 },
        { key: 'water', grams: 166 },
        { key: 'salt', grams: 21 },
      ]);
    });

    it('runs the full method: 4 poolish + 11 dough steps + the bake', () => {
      const method = service.build(makeInput(), makePoolishOutput(), now);

      expect(method.steps.length).toBe(16);
    });

    it('dates the milestones on the engine timings, quarter-hour grid', () => {
      const method = service.build(makeInput(), makePoolishOutput(), now);
      const dated = method.steps
        .filter((step) => step.at)
        .map((step) => [step.title, step.at]);

      expect(dated).toEqual([
        // 20:53 ceiled to the grid.
        [STEPS + 'mixIngredients.title', new Date(2026, 6, 14, 21, 0)],
        // Into the fridge after 1 h of handling + 16 h ambient.
        [STEPS + 'restCold.title', new Date(2026, 6, 15, 14, 0)],
        // Out of the fridge 1 h before the frasage (+8 h cold).
        [STEPS + 'takeOutPoolish.title', new Date(2026, 6, 15, 22, 0)],
        // The frasage lands exactly on poolish.prepTime — same clock as
        // the Expert preview.
        [STEPS + 'addWaterSalt.title', new Date(2026, 6, 15, 23, 0)],
        // Balling one DOUGH_BASE_TIME after the frasage.
        [STEPS + 'formBalls.title', new Date(2026, 6, 16, 0, 0)],
        // The bake closes the run, at total.prepTime.
        [STEPS + 'bake.title', new Date(2026, 6, 16, 2, 0)],
      ]);
    });

    it('attaches each frasage quantity to the step that incorporates it', () => {
      const method = service.build(makeInput(), makePoolishOutput(), now);
      const frasage = method.steps.find(
        (step) => step.title === STEPS + 'addWaterSalt.title',
      );
      const flour = method.steps.find(
        (step) => step.title === STEPS + 'addFlourPoolishDough.title',
      );

      expect(frasage?.ingredients).toEqual([
        { key: 'water', grams: 166 },
        { key: 'salt', grams: 21 },
      ]);
      expect(frasage?.variables['hasSalt']).toBeTrue();
      expect(frasage?.variables['hasOliveOil']).toBeFalse();
      expect(flour?.ingredients).toEqual([{ key: 'flour', grams: 453 }]);
    });

    it('incorporates optional olive oil during the poolish frasage', () => {
      const output = makePoolishOutput();
      output.dough.oliveOil = 12.2;
      const method = service.build(makeInput(), output, now);
      const frasage = method.steps.find(
        (step) => step.title === STEPS + 'addWaterSalt.title',
      );

      expect(frasage?.ingredients).toEqual([
        { key: 'water', grams: 166 },
        { key: 'salt', grams: 21 },
        { key: 'oliveOil', grams: 12 },
      ]);
      expect(frasage?.variables['hasOliveOil']).toBeTrue();
    });

    it('gives the poolish mix its quantities and the poolish rests', () => {
      const method = service.build(makeInput(), makePoolishOutput(), now);
      const mix = method.steps[0];

      expect(mix.ingredients).toEqual([
        { key: 'water', grams: 302 },
        { key: 'yeast', grams: 0.84 },
        { key: 'honey', grams: 3 },
      ]);
      expect(mix.variables['hasHoney']).toBeTrue();
      expect(mix.variables['rtRestTime']).toBe(16);
      expect(mix.variables['coldRestTime']).toBe(8);
    });

    it('rounds the balls weight and the final rest for the narration', () => {
      const output = makePoolishOutput();
      output.pizzaBalls.weight = 272.727;
      output.pizzaBalls.rtRestTime = 2.4;

      const method = service.build(makeInput(), output, now);
      const balls = method.steps.find(
        (step) => step.title === STEPS + 'formBalls.title',
      );
      const finalRest = method.steps.find(
        (step) => step.title === STEPS + 'finalRest.title',
      );

      expect(balls?.variables['pizzaWeight']).toBe(273);
      expect(finalRest?.at).toBeNull();
      expect(finalRest?.variables['rtRestTime']).toBe(2);
    });

    it('expands helpers, and leaves none on the helperless steps', () => {
      const method = service.build(makeInput(), makePoolishOutput(), now);
      const knead = method.steps.find(
        (step) => step.title === STEPS + 'knead.title',
      );
      const restOneHour = method.steps.find(
        (step) => step.title === STEPS + 'restOneHour.title',
      );

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

    it('starts and finishes on the announced clock', () => {
      const method = service.build(makeInput(), makePoolishOutput(), now);

      expect(method.startAt).toEqual(new Date(2026, 6, 14, 21, 0));
      expect(method.readyAt).toEqual(new Date(2026, 6, 16, 2, 0));
    });
  });

  describe('with a poolish dough kept at room temperature', () => {
    const warmOutput = (): ICalculatorOutput => {
      const output = makePoolishOutput();
      output.poolish.coldRestTime = 0;
      output.poolish.prepTime = 17; // 1 + 16
      output.total.prepTime = 20; // + 1 h dough + 2 h balls
      return output;
    };

    it('hides the fridge steps and re-dates the frasage', () => {
      const method = service.build(makeInput(), warmOutput(), now);
      const titles = method.steps.map((step) => step.title);

      expect(method.steps.length).toBe(14);
      expect(titles).not.toContain(STEPS + 'restCold.title');
      expect(titles).not.toContain(STEPS + 'takeOutPoolish.title');

      const frasage = method.steps.find(
        (step) => step.title === STEPS + 'addWaterSalt.title',
      );
      expect(frasage?.at).toEqual(new Date(2026, 6, 15, 14, 0));
    });
  });

  describe('with a direct dough (no cold rest)', () => {
    const directInput = makeInput({
      doughType: DoughType.DIRECT,
      rtRestTime: 8,
      coldRestTime: 0,
    });

    it('weighs in a single part with every non-zero ingredient', () => {
      const method = service.build(directInput, makeDirectOutput(), now);

      expect(method.sections.length).toBe(1);
      expect(method.sections[0].title).toBe(
        'calculator.method.titles.directDough',
      );
      expect(method.sections[0].ingredients).toEqual([
        { key: 'flour', grams: 755 },
        { key: 'water', grams: 468 },
        { key: 'yeast', grams: 2.14 },
        { key: 'salt', grams: 21 },
        { key: 'honey', grams: 3 },
        { key: 'oliveOil', grams: 12 },
      ]);
    });

    it('runs 10 visible steps plus the bake', () => {
      const method = service.build(directInput, makeDirectOutput(), now);
      const titles = method.steps.map((step) => step.title);

      expect(method.steps.length).toBe(11);
      expect(titles).not.toContain(STEPS + 'restCold.title');
      expect(titles).not.toContain(STEPS + 'takeOutDough.title');
    });

    it('dates the mix, the balling and the bake on the engine timings', () => {
      const method = service.build(directInput, makeDirectOutput(), now);
      const dated = method.steps
        .filter((step) => step.at)
        .map((step) => [step.title, step.at]);

      expect(dated).toEqual([
        [STEPS + 'mixIngredients.title', new Date(2026, 6, 14, 21, 0)],
        // dough.prepTime = 9 h — same clock as the Expert preview.
        [STEPS + 'formBalls.title', new Date(2026, 6, 15, 6, 0)],
        [STEPS + 'bake.title', new Date(2026, 6, 15, 8, 0)],
      ]);
    });

    it('narrates ingredient quantities on their actual incorporation step', () => {
      const method = service.build(directInput, makeDirectOutput(), now);
      const mix = method.steps.find(
        (step) => step.title === STEPS + 'mixIngredients.title',
      );
      const flour = method.steps.find(
        (step) => step.title === STEPS + 'addFlourSaltOil.title',
      );

      expect(mix?.ingredients).toEqual([
        { key: 'water', grams: 468 },
        { key: 'yeast', grams: 2.14 },
        { key: 'honey', grams: 3 },
      ]);
      expect(flour?.ingredients).toEqual([
        { key: 'flour', grams: 755 },
        { key: 'salt', grams: 21 },
        { key: 'oliveOil', grams: 12 },
      ]);
    });
  });

  describe('with a direct dough through the fridge', () => {
    const coldInput = makeInput({
      doughType: DoughType.DIRECT,
      rtRestTime: 8,
      coldRestTime: 24,
    });
    const coldOutput = (): ICalculatorOutput => {
      const output = makeDirectOutput();
      output.dough.rtRestTime = 8;
      output.dough.coldRestTime = 24;
      output.dough.prepTime = 34; // 1 + 8 + 24 + 1
      output.total.prepTime = 36;
      return output;
    };

    it('dates the fridge trips around the cold rest', () => {
      const method = service.build(coldInput, coldOutput(), now);
      const dated = method.steps
        .filter((step) => step.at)
        .map((step) => [step.title, step.at]);

      expect(method.steps.length).toBe(13);
      expect(dated).toEqual([
        [STEPS + 'mixIngredients.title', new Date(2026, 6, 14, 21, 0)],
        // Into the fridge after 1 h of handling + 8 h ambient.
        [STEPS + 'restCold.title', new Date(2026, 6, 15, 6, 0)],
        // Out of the fridge 1 h before balling (+24 h cold).
        [STEPS + 'takeOutDough.title', new Date(2026, 6, 16, 6, 0)],
        [STEPS + 'formBalls.title', new Date(2026, 6, 16, 7, 0)],
        [STEPS + 'bake.title', new Date(2026, 6, 16, 9, 0)],
      ]);
    });
  });

  it('never rounds a tiny yeast down to nothing', () => {
    const output = makePoolishOutput();
    output.poolish.yeast = 0.004;

    const method = service.build(makeInput(), output, now);

    expect(method.sections[0].ingredients).toContain({
      key: 'yeast',
      grams: 0.01,
    });
  });
});
