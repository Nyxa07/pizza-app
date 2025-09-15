import { Injectable } from '@angular/core';
import { PizzaType } from '../../../settings/enums/pizza-type.enum';
import { IProcessor } from '../../interfaces/processor.interface';
import { CalculatorConfigService } from '../calculator-config.service';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';

export interface HydrationRange {
  /** Lower bound of recommended hydration (decimal, e.g. 0.60 for 60 %) */
  minHydration: number;
  /** Upper bound of recommended hydration (decimal, e.g. 0.65 for 65 %) */
  maxHydration: number;
}

@Injectable({ providedIn: 'root' })
export class HydrationProcessor implements IProcessor {
  constructor(private calculatorConfigService: CalculatorConfigService) {}

  process(input: ICalculatorInput) {
    return {
      hydrationRatio:
        input.hydrationRatio ??
        this.compute(input.flourStrength, input.pizzaType).minHydration,
    };
  }

  /**
   * Returns the recommended hydration range (min / max) for a given flour strength (W).
   * The central recommendation is computed via a linear model and then a symmetric tolerance
   * of ±tolerance around that value is applied. Finally, the range is clamped by the hard
   * limits defined in the configuration.
   */
  private compute(flourStrength: number, pizzaType: PizzaType): HydrationRange {
    const mid = this.recommendedHydration(flourStrength, pizzaType);
    const cfg = this.calculatorConfigService.constants.hydrationRecommendation;

    // 2 % absolute tolerance yields a sensible ± window (can be adjusted later via cfg)
    const tolerance = 0.02;

    const minHydration = Math.max(cfg[pizzaType].minHydration, mid - tolerance);
    const maxHydration = Math.min(cfg[pizzaType].maxHydration, mid + tolerance);

    return { minHydration, maxHydration };
  }

  /**
   * Central recommended hydration ratio (water / flour) for a given flour strength (W).
   * Uses a linear model: h = base + slope * (W - reference), then clamps to config bounds.
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
