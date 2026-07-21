import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';

import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import {
  ICalculatorOutput,
  Quantity,
} from '../interfaces/calculator-output.interface';
import { MethodPreviewService } from './method-preview.service';

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
  // The engine sends the honey into the poolish itself (dough.honey = 0).
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

describe('MethodPreviewService', () => {
  let service: MethodPreviewService;
  // A Tuesday evening, deliberately off the quarter-hour grid.
  const now = new Date(2026, 6, 14, 20, 53);

  beforeEach(() => {
    service = new MethodPreviewService();
  });

  describe('with a poolish dough', () => {
    it('dates the poolish mix on the next quarter-hour', () => {
      const { steps } = service.buildPreview(
        makeInput(),
        makePoolishOutput(),
        now,
      );

      expect(steps[0].bodyKey).toBe(
        'calculator.expert.method.steps.poolishMix',
      );
      expect(steps[0].at).toEqual(new Date(2026, 6, 14, 21, 0));
    });

    it('lists the poolish ingredients (honey included), yeast kept to one decimal', () => {
      const { steps } = service.buildPreview(
        makeInput(),
        makePoolishOutput(),
        now,
      );

      expect(steps[0].ingredients).toEqual([
        { key: 'flour', grams: 302 },
        { key: 'water', grams: 302 },
        { key: 'yeast', grams: 0.8 },
        { key: 'honey', grams: 3 },
      ]);
    });

    it('dates the frasage after the poolish maturation, skipping zero ingredients', () => {
      const { steps } = service.buildPreview(
        makeInput(),
        makePoolishOutput(),
        now,
      );

      expect(steps[1].bodyKey).toBe(
        'calculator.expert.method.steps.poolishKnead',
      );
      // 21:00 + 26 h of poolish prep.
      expect(steps[1].at).toEqual(new Date(2026, 6, 15, 23, 0));
      // Honey already went into the poolish; olive oil is 0 g. Neither
      // belongs in the frasage narration.
      expect(steps[1].ingredients).toEqual([
        { key: 'flour', grams: 453 },
        { key: 'water', grams: 166 },
        { key: 'salt', grams: 21 },
      ]);
    });

    it('counts every step of the real poolish method through the bake', () => {
      const preview = service.buildPreview(
        makeInput(),
        makePoolishOutput(),
        now,
      );

      // PoolishMethod: 4 visible steps; PoolishDoughMethod: 12 visible steps
      // including the bake (cold rest and final rest hide nothing).
      expect(preview.totalSteps).toBe(16);
    });

    it('announces when the dough is ready, on the quarter-hour grid', () => {
      const preview = service.buildPreview(
        makeInput(),
        makePoolishOutput(),
        now,
      );

      // 21:00 + 29 h total prep.
      expect(preview.readyAt).toEqual(new Date(2026, 6, 16, 2, 0));
    });

    it('never rounds the tiny poolish yeast down to nothing', () => {
      const output = makePoolishOutput();
      output.poolish.yeast = 0.04;

      const { steps } = service.buildPreview(makeInput(), output, now);

      expect(steps[0].ingredients).toContain({ key: 'yeast', grams: 0.1 });
    });
  });

  describe('with a direct dough', () => {
    const directInput = makeInput({
      doughType: DoughType.DIRECT,
      rtRestTime: 8,
      coldRestTime: 0,
    });

    it('narrates the single mix with every non-zero ingredient', () => {
      const { steps } = service.buildPreview(
        directInput,
        makeDirectOutput(),
        now,
      );

      expect(steps[0].bodyKey).toBe('calculator.expert.method.steps.directMix');
      expect(steps[0].at).toEqual(new Date(2026, 6, 14, 21, 0));
      expect(steps[0].ingredients).toEqual([
        { key: 'flour', grams: 755 },
        { key: 'water', grams: 468 },
        { key: 'yeast', grams: 2.1 },
        { key: 'salt', grams: 21 },
        { key: 'honey', grams: 3 },
        { key: 'oliveOil', grams: 12 },
      ]);
    });

    it('dates the ball forming after the bulk rest', () => {
      const { steps } = service.buildPreview(
        directInput,
        makeDirectOutput(),
        now,
      );

      expect(steps[1].bodyKey).toBe(
        'calculator.expert.method.steps.directBalls',
      );
      // 21:00 + 9 h of dough prep.
      expect(steps[1].at).toEqual(new Date(2026, 6, 15, 6, 0));
      expect(steps[1].ingredients).toEqual([]);
      expect(steps[1].bodyParams).toEqual({ count: 5, weight: 250 });
    });

    it('counts only the visible steps when the cold rest is skipped', () => {
      const preview = service.buildPreview(
        directInput,
        makeDirectOutput(),
        now,
      );

      // DirectDoughMethod has 13 steps; no cold rest hides restCold and
      // takeOutDough, leaving the bake as the final eleventh step.
      expect(preview.totalSteps).toBe(11);
    });

    it('keeps a start time already on the grid untouched', () => {
      const sharpNow = new Date(2026, 6, 14, 21, 0, 0, 0);

      const { steps } = service.buildPreview(
        directInput,
        makeDirectOutput(),
        sharpNow,
      );

      expect(steps[0].at).toEqual(sharpNow);
    });
  });
});
