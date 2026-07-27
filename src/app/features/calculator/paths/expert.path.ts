import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { clampWeight } from '../pizza-format.model';
import { EXPERT_DRAFT_STORAGE_KEY } from './calculator-draft-storage.constants';
import type { PathDefinition } from './path-definition.interface';

/**
 * The Expert path holds the complete technical input, so its Draft *is* the
 * engine input: nothing is hidden, nothing is derived on the user's behalf.
 * It is also where « Ajuster » and the suggested Dough land (ADR-0003).
 */
export const EXPERT_PATH: PathDefinition<ICalculatorInput> = {
  storageKey: EXPERT_DRAFT_STORAGE_KEY,

  seed: (defaults) => ({ ...defaults }),

  /**
   * A ball weight is always inside the bounds of its style: the Draft may
   * arrive from an older release, from a Dough saved before the bounds
   * existed, or from a style change. It only ever rewrites the Draft — saved
   * Doughs and Defaults keep whatever they hold.
   */
  normalize: (draft) => {
    if (draft.pizzaWeight === null) {
      return draft;
    }

    const pizzaWeight = clampWeight(draft.pizzaType, draft.pizzaWeight);
    return pizzaWeight === draft.pizzaWeight
      ? draft
      : { ...draft, pizzaWeight };
  },

  toInput: (draft) => draft,
};
