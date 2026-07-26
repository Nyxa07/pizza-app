import { Injectable, inject } from '@angular/core';

import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import { weightForSize } from '../pizza-format.model';
import { DoughDefaultsService } from './dough-defaults.service';

/** The flour this path assumes — the value the Guided « I don't know » applies. */
const INTERMEDIATE_FLOUR_STRENGTH = 270;

/** The salt this path pins, the factory Default, never the user's own. */
const INTERMEDIATE_SALT_RATIO = 0.028;

/**
 * Adapter at the Intermediate/engine seam (twin of the Guided one). It holds
 * every decision this path takes for the user, so the screen knows no recipe
 * constant and the engine learns nothing new — and it never reads the Expert
 * Draft (ADR-0003).
 */
@Injectable({ providedIn: 'root' })
export class IntermediateInputAdapter {
  private readonly defaults = inject(DoughDefaultsService);

  resolve(draft: IIntermediateCalculatorDraft): ICalculatorInput {
    const defaults = this.defaults.getDefaults();

    return {
      ...defaults,
      pizzaType: draft.pizzaType,
      nbPizzas: draft.nbPizzas,
      doughType: draft.doughType,
      yeastType: draft.yeastType,
      temperature: draft.temperature,
      // The size is the answer, the weight its consequence.
      pizzaWeight: weightForSize(draft.pizzaType, draft.sizeCm),
      flourStrength: INTERMEDIATE_FLOUR_STRENGTH,
      saltRatio: INTERMEDIATE_SALT_RATIO,
      honeyRatio: 0,
      // Left to derive: the engine applies the style's recommended hydration
      // and its olive oil (0 % Neapolitan, 1.6 % Roman).
      hydrationRatio: null,
      oliveOilRatio: null,
      // One slider, and the engine owns the ambient/cold split.
      globalRestTime: draft.globalRestTime,
      rtRestTime: null,
      coldRestTime: null,
    };
  }
}
