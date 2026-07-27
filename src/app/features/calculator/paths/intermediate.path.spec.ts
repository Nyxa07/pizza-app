import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import type { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import { FACTORY_DEFAULTS } from '../services/dough-defaults.service';
import { INTERMEDIATE_PATH } from './intermediate.path';

/** « Mes pâtes par défaut », as the module reads them. */
const defaults = (
  partial: Partial<ICalculatorInput> = {},
): ICalculatorInput => ({
  ...FACTORY_DEFAULTS,
  ...partial,
});

const draft = (
  partial: Partial<IIntermediateCalculatorDraft> = {},
): IIntermediateCalculatorDraft => ({
  pizzaType: PizzaType.NEAPOLITAN,
  nbPizzas: 6,
  sizeCm: 30,
  doughType: DoughType.DIRECT,
  globalRestTime: 36,
  temperature: 22,
  yeastType: YeastType.FRESH,
  ...partial,
});

/**
 * What the Intermediate path decides for the user: the size is the answer,
 * the weight its consequence, and every recipe constant is pinned here so the
 * screen knows none of them (ADR-0003).
 */
describe('INTERMEDIATE_PATH', () => {
  describe('seed', () => {
    it('reads the seed size back from the default ball weight', () => {
      // 250 g of factory Default, read back as the size that makes it.
      expect(INTERMEDIATE_PATH.seed(defaults()).sizeCm).toBe(28);
      expect(
        INTERMEDIATE_PATH.seed(
          defaults({ pizzaType: PizzaType.ROMAN, pizzaWeight: 180 }),
        ).sizeCm,
      ).toBe(31);
    });

    it('falls back on the style when the Defaults carry no weight', () => {
      expect(
        INTERMEDIATE_PATH.seed(
          defaults({ pizzaType: PizzaType.ROMAN, pizzaWeight: null }),
        ).sizeCm,
      ).toBe(31);
    });

    it('holds only the answers the screen asks for', () => {
      expect(Object.keys(INTERMEDIATE_PATH.seed(defaults())).sort()).toEqual([
        'doughType',
        'globalRestTime',
        'nbPizzas',
        'pizzaType',
        'sizeCm',
        'temperature',
        'yeastType',
      ]);
    });

    it('rests for a day when the Defaults carry no total rest', () => {
      expect(
        INTERMEDIATE_PATH.seed(defaults({ globalRestTime: null })),
      ).toEqual(jasmine.objectContaining({ globalRestTime: 24 }));
    });
  });

  describe('normalize', () => {
    it('brings a size inherited from another style back into range', () => {
      // A 35 cm Neapolitan answered, then the style switched to Roman.
      expect(
        INTERMEDIATE_PATH.normalize(
          draft({ pizzaType: PizzaType.ROMAN, sizeCm: 35 }),
        ).sizeCm,
      ).toBe(33);
    });

    it('is idempotent, so re-reading a Draft never moves it', () => {
      const once = INTERMEDIATE_PATH.normalize(draft({ sizeCm: 42 }));

      expect(INTERMEDIATE_PATH.normalize(once)).toEqual(once);
      expect(once.sizeCm).toBe(35);
    });

    it('leaves a size the style can produce alone', () => {
      const answers = draft({ sizeCm: 30 });

      expect(INTERMEDIATE_PATH.normalize(answers)).toEqual(answers);
    });
  });

  describe('toInput', () => {
    it('turns the answered size into an explicit ball weight', () => {
      expect(INTERMEDIATE_PATH.toInput(draft(), defaults()).pizzaWeight).toBe(
        270,
      );
      expect(
        INTERMEDIATE_PATH.toInput(
          draft({ pizzaType: PizzaType.ROMAN }),
          defaults(),
        ).pizzaWeight,
      ).toBe(170);
    });

    it('weighs both bounds of both styles from the format model', () => {
      const weightOf = (pizzaType: PizzaType, sizeCm: number) =>
        INTERMEDIATE_PATH.toInput(draft({ pizzaType, sizeCm }), defaults())
          .pizzaWeight;

      expect(weightOf(PizzaType.NEAPOLITAN, 26)).toBe(220);
      expect(weightOf(PizzaType.NEAPOLITAN, 35)).toBe(340);
      expect(weightOf(PizzaType.ROMAN, 26)).toBe(130);
      expect(weightOf(PizzaType.ROMAN, 33)).toBe(210);
    });

    it('always applies W270 — this path never asks for the flour', () => {
      expect(
        INTERMEDIATE_PATH.toInput(draft(), defaults({ flourStrength: 350 }))
          .flourStrength,
      ).toBe(270);
    });

    it('pins the salt independently of the user Defaults', () => {
      expect(
        INTERMEDIATE_PATH.toInput(draft(), defaults({ saltRatio: 0.04 }))
          .saltRatio,
      ).toBe(0.028);
    });

    it('adds no honey, whatever the Defaults hold', () => {
      expect(
        INTERMEDIATE_PATH.toInput(draft(), defaults({ honeyRatio: 0.005 }))
          .honeyRatio,
      ).toBe(0);
    });

    it('leaves the olive oil to the style and the hydration to the engine', () => {
      const input = INTERMEDIATE_PATH.toInput(draft(), defaults());

      expect(input.oliveOilRatio).toBeNull();
      expect(input.hydrationRatio).toBeNull();
    });

    it('hands the engine a total rest with no pre-computed split', () => {
      const input = INTERMEDIATE_PATH.toInput(draft(), defaults());

      expect(input.globalRestTime).toBe(36);
      expect(input.rtRestTime).toBeNull();
      expect(input.coldRestTime).toBeNull();
    });

    it('carries every remaining answer through untouched', () => {
      expect(INTERMEDIATE_PATH.toInput(draft(), defaults())).toEqual(
        jasmine.objectContaining({
          pizzaType: PizzaType.NEAPOLITAN,
          nbPizzas: 6,
          doughType: DoughType.DIRECT,
          temperature: 22,
          yeastType: YeastType.FRESH,
        }),
      );
    });

    it('takes the unexposed poolish ratio from the Defaults', () => {
      expect(INTERMEDIATE_PATH.toInput(draft(), defaults()).poolishRatio).toBe(
        0.4,
      );
    });
  });
});
