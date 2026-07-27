import { ASSUMED_FLOUR_STRENGTH } from '../dough.constants';
import type { IGuidedCalculatorDraft } from '../interfaces/guided-calculator-draft.interface';
import { FACTORY_DEFAULTS } from '../services/dough-defaults.service';
import { GUIDED_DRAFT_STORAGE_KEY } from './calculator-draft-storage.constants';
import type { PathDefinition } from './path-definition.interface';

/**
 * The Guided path: one plain-language decision at a time. Every technical
 * input the path does not expose is derived here — the salt stays the user's
 * own, unlike the Intermediate path, because « Mes pâtes par défaut » is the
 * one place a Guided user ever meets it.
 */
export const GUIDED_PATH: PathDefinition<IGuidedCalculatorDraft> = {
  storageKey: GUIDED_DRAFT_STORAGE_KEY,

  seed: (defaults) => ({
    pizzaType: defaults.pizzaType,
    nbPizzas: defaults.nbPizzas,
    doughType: defaults.doughType,
    // The Defaults screen never clears the total rest, but the type allows it
    // and this path has no second question to fall back on.
    globalRestTime: defaults.globalRestTime ?? FACTORY_DEFAULTS.globalRestTime,
    temperature: defaults.temperature,
    yeastType: defaults.yeastType,
  }),

  // Nothing this path asks depends on the style, so nothing can fall out of
  // range: the ball weight it never exposes is derived by the engine.
  normalize: (draft) => draft,

  toInput: (draft, defaults) => ({
    ...defaults,
    pizzaType: draft.pizzaType,
    nbPizzas: draft.nbPizzas,
    doughType: draft.doughType,
    yeastType: draft.yeastType,
    temperature: draft.temperature,
    flourStrength: ASSUMED_FLOUR_STRENGTH,
    // One slider, and the engine owns the ambient/cold split.
    globalRestTime: draft.globalRestTime,
    rtRestTime: null,
    coldRestTime: null,
    // Left to derive: the engine applies the style's recommended hydration,
    // its olive oil and the ball weight of its reference size.
    hydrationRatio: null,
    pizzaWeight: null,
    oliveOilRatio: null,
  }),
};
