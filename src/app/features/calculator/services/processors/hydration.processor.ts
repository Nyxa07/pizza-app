import { Injectable, inject } from '@angular/core';
import { PizzaType } from '../../../settings/enums/pizza-type.enum';
import { IProcessor } from '../../interfaces/processor.interface';
import { CalculatorConfigService } from '../calculator-config.service';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';

@Injectable({ providedIn: 'root' })
export class HydrationProcessor implements IProcessor {
  private readonly calculatorConfigService = inject(CalculatorConfigService);

  process(input: ICalculatorInput) {
    return {
      hydrationRatio:
        input.hydrationRatio ??
        this.recommendedHydration(input.flourStrength, input.pizzaType),
    };
  }

  /**
   * Effective hydration ratio for a given flour strength (W).
   * Uses a linear model: h = base + slope * (W - reference), then clamps to
   * the style's final output bounds.
   */
  private recommendedHydration(W: number, pizzaType: PizzaType): number {
    const cfg = this.calculatorConfigService.constants.hydrationRecommendation;
    const raw =
      cfg[pizzaType].baseHydration +
      cfg[pizzaType].slope * (W - cfg[pizzaType].referenceW);
    return Math.max(
      cfg[pizzaType].minHydration,
      Math.min(cfg[pizzaType].maxHydration, raw),
    );
  }
}
