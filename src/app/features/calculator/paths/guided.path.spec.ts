import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import type { IGuidedCalculatorDraft } from '../interfaces/guided-calculator-draft.interface';
import { FACTORY_DEFAULTS } from '../services/dough-defaults.service';
import { GUIDED_PATH } from './guided.path';

/** « Mes pâtes par défaut », as the module reads them. */
const defaults = (
  partial: Partial<ICalculatorInput> = {},
): ICalculatorInput => ({
  ...FACTORY_DEFAULTS,
  ...partial,
});

const draft = (
  partial: Partial<IGuidedCalculatorDraft> = {},
): IGuidedCalculatorDraft => ({
  pizzaType: PizzaType.ROMAN,
  nbPizzas: 4,
  doughType: DoughType.POOLISH,
  globalRestTime: 24,
  temperature: 22,
  yeastType: YeastType.FRESH,
  ...partial,
});

/**
 * What the Guided path decides for the user: everything technical is derived
 * rather than asked, and never read off another path's Draft (ADR-0003).
 */
describe('GUIDED_PATH', () => {
  describe('seed', () => {
    it('holds only the answers the path asks for', () => {
      expect(Object.keys(GUIDED_PATH.seed(defaults())).sort()).toEqual([
        'doughType',
        'globalRestTime',
        'nbPizzas',
        'pizzaType',
        'temperature',
        'yeastType',
      ]);
    });

    it('starts a new calculation from « Mes pâtes par défaut »', () => {
      expect(
        GUIDED_PATH.seed(defaults({ nbPizzas: 3, pizzaType: PizzaType.ROMAN })),
      ).toEqual(
        jasmine.objectContaining({
          nbPizzas: 3,
          pizzaType: PizzaType.ROMAN,
          globalRestTime: 24,
        }),
      );
    });

    it('rests for a day when the Defaults carry no total rest', () => {
      expect(GUIDED_PATH.seed(defaults({ globalRestTime: null }))).toEqual(
        jasmine.objectContaining({ globalRestTime: 24 }),
      );
    });
  });

  it('asks nothing a style can invalidate, so it normalizes nothing', () => {
    const answers = draft();

    expect(GUIDED_PATH.normalize(answers)).toEqual(answers);
  });

  describe('toInput', () => {
    it('always applies W270 — this path never asks for the flour', () => {
      expect(GUIDED_PATH.toInput(draft(), defaults()).flourStrength).toBe(270);
      expect(
        GUIDED_PATH.toInput(draft(), defaults({ flourStrength: 350 }))
          .flourStrength,
      ).toBe(270);
    });

    it('keeps the salt of the user, unlike the Intermediate path', () => {
      expect(
        GUIDED_PATH.toInput(draft(), defaults({ saltRatio: 0.04 })).saltRatio,
      ).toBe(0.04);
    });

    it('hands the engine a total rest with no pre-computed split', () => {
      const input = GUIDED_PATH.toInput(
        draft({ globalRestTime: 36 }),
        defaults(),
      );

      expect(input.globalRestTime).toBe(36);
      expect(input.rtRestTime).toBeNull();
      expect(input.coldRestTime).toBeNull();
    });

    it('leaves the hydration, the weight and the olive oil to derive', () => {
      const input = GUIDED_PATH.toInput(draft(), defaults());

      expect(input.hydrationRatio).toBeNull();
      expect(input.pizzaWeight).toBeNull();
      expect(input.oliveOilRatio).toBeNull();
    });

    it('carries every explicit answer through untouched', () => {
      expect(GUIDED_PATH.toInput(draft(), defaults())).toEqual(
        jasmine.objectContaining({
          pizzaType: PizzaType.ROMAN,
          nbPizzas: 4,
          doughType: DoughType.POOLISH,
          temperature: 22,
          yeastType: YeastType.FRESH,
        }),
      );
    });

    it('takes the unexposed poolish ratio from the Defaults', () => {
      expect(GUIDED_PATH.toInput(draft(), defaults()).poolishRatio).toBe(0.4);
    });
  });
});
