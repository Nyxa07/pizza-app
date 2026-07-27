import { PizzaType } from '../../settings/enums/pizza-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { FACTORY_DEFAULTS } from '../services/dough-defaults.service';
import { EXPERT_PATH } from './expert.path';

/** « Mes pâtes par défaut », as the module reads them. */
const defaults = (
  partial: Partial<ICalculatorInput> = {},
): ICalculatorInput => ({
  ...FACTORY_DEFAULTS,
  ...partial,
});

/**
 * The Expert path holds the complete technical input, so its Draft *is* the
 * engine input. The only decision it takes for the user is keeping the ball
 * weight inside the style.
 */
describe('EXPERT_PATH', () => {
  describe('seed', () => {
    it('starts a new calculation from « Mes pâtes par défaut »', () => {
      expect(EXPERT_PATH.seed(defaults({ hydrationRatio: 0.8 }))).toEqual(
        defaults({ hydrationRatio: 0.8 }),
      );
    });

    it('detaches the seed, so editing the Draft never writes a Default', () => {
      const source = defaults();

      const seeded = EXPERT_PATH.seed(source);
      seeded.nbPizzas = 9;

      expect(source.nbPizzas).toBe(5);
    });
  });

  describe('normalize', () => {
    /**
     * A Draft may arrive from an older release, from a Dough saved before the
     * bounds existed, or from a style change.
     */
    it('brings a ball weight back inside the bounds of its style', () => {
      expect(
        EXPERT_PATH.normalize(
          defaults({ pizzaType: PizzaType.ROMAN, pizzaWeight: 340 }),
        ).pizzaWeight,
      ).toBe(210);
    });

    it('leaves « to derive » alone — no weight is still no weight', () => {
      expect(EXPERT_PATH.normalize(defaults({ pizzaWeight: null }))).toEqual(
        defaults({ pizzaWeight: null }),
      );
    });

    it('is idempotent, so re-reading a Draft never moves it', () => {
      const once = EXPERT_PATH.normalize(
        defaults({ pizzaType: PizzaType.ROMAN, pizzaWeight: 340 }),
      );

      expect(EXPERT_PATH.normalize(once)).toEqual(once);
    });

    it('leaves a weight the style can produce alone', () => {
      const input = defaults({ pizzaWeight: 250 });

      expect(EXPERT_PATH.normalize(input)).toEqual(input);
    });
  });

  it('is its own engine input — nothing to resolve', () => {
    const input = defaults({ nbPizzas: 9, flourStrength: 350 });

    expect(EXPERT_PATH.toInput(input, defaults())).toEqual(input);
  });
});
