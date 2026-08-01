import { ASSUMED_FLOUR_STRENGTH } from '../dough.constants';
import type { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import {
  clampSize,
  fallbackWeight,
  sizeForWeight,
  weightForSize,
} from '../pizza-format.model';
import { FACTORY_DEFAULTS } from '../services/dough-defaults.service';
import { INTERMEDIATE_DRAFT_STORAGE_KEY } from './calculator-draft-storage.constants';
import type { PathDefinition } from './path-definition.interface';

/** The salt this path pins, the factory Default, never the user's own. */
const INTERMEDIATE_SALT_RATIO = 0.028;

/**
 * The Intermediate path: the user answers in pizzas, not in baker's
 * percentages. The size is the answer and the weight its consequence, so
 * changing the style changes the weight without the user retouching anything.
 */
export const INTERMEDIATE_PATH: PathDefinition<IIntermediateCalculatorDraft> = {
  storageKey: INTERMEDIATE_DRAFT_STORAGE_KEY,

  /**
   * A new calculation starts from « Mes pâtes par défaut ». The Defaults
   * speak in grams, this path in centimetres, so the seed size is read back
   * from the default ball weight — 28 cm Neapolitan, 31 cm Roman out of the
   * factory.
   */
  seed: (defaults) => ({
    pizzaType: defaults.pizzaType,
    nbPizzas: defaults.nbPizzas,
    sizeCm: sizeForWeight(
      defaults.pizzaType,
      // A Default carrying no weight falls back on the style's own.
      defaults.pizzaWeight ?? fallbackWeight(defaults.pizzaType),
    ),
    doughType: defaults.doughType,
    // The Defaults screen never clears the total rest, but the type allows it
    // and this path has no second question to fall back on.
    globalRestTime: defaults.globalRestTime ?? FACTORY_DEFAULTS.globalRestTime,
    temperature: defaults.temperature,
    yeastType: defaults.yeastType,
  }),

  /**
   * The size always sits inside the range of its style: switching to a style
   * that stops earlier brings a 35 cm Neapolitan back to a 33 cm Roman, and
   * that clamped value becomes the user's new answer.
   */
  normalize: (draft) => {
    const sizeCm = clampSize(draft.pizzaType, draft.sizeCm);

    return sizeCm === draft.sizeCm ? draft : { ...draft, sizeCm };
  },

  toInput: (draft, defaults) => ({
    ...defaults,
    pizzaType: draft.pizzaType,
    nbPizzas: draft.nbPizzas,
    doughType: draft.doughType,
    yeastType: draft.yeastType,
    temperature: draft.temperature,
    // The size is the answer, the weight its consequence — and the Draft is
    // already inside its style, so there is nothing left to clamp here.
    pizzaWeight: weightForSize(draft.pizzaType, draft.sizeCm),
    flourStrength: ASSUMED_FLOUR_STRENGTH,
    saltRatio: INTERMEDIATE_SALT_RATIO,
    honeyRatio: 0,
    // One total, and the engine owns the ambient/cold split.
    globalRestTime: draft.globalRestTime,
    rtRestTime: null,
    coldRestTime: null,
    // Left to derive: the engine applies the style's recommended hydration
    // and its olive oil (0 % Neapolitan, 1.6 % Roman).
    hydrationRatio: null,
    oliveOilRatio: null,
  }),
};
