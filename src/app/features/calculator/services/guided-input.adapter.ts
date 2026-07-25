import { Injectable, inject } from '@angular/core';

import {
  IGuidedCalculatorDraft,
  UNKNOWN_FLOUR_STRENGTH,
} from '../interfaces/guided-calculator-draft.interface';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { DoughDefaultsService } from './dough-defaults.service';

/**
 * Adapter at the Guided/engine seam. It resolves every hidden technical input
 * without ever reading the Expert Draft.
 */
@Injectable({ providedIn: 'root' })
export class GuidedInputAdapter {
  private readonly defaults = inject(DoughDefaultsService);

  resolve(draft: IGuidedCalculatorDraft): ICalculatorInput {
    const defaults = this.defaults.getDefaults();

    return {
      ...defaults,
      pizzaType: draft.pizzaType,
      nbPizzas: draft.nbPizzas,
      doughType: draft.doughType,
      yeastType: draft.yeastType,
      hydrationRatio: null,
      temperature: draft.temperature,
      globalRestTime: draft.globalRestTime,
      rtRestTime: null,
      coldRestTime: null,
      flourStrength:
        draft.flourStrengthChoice === UNKNOWN_FLOUR_STRENGTH
          ? 270
          : draft.flourStrengthChoice,
      pizzaWeight: null,
      oliveOilRatio: null,
    };
  }
}
