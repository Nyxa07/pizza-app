import { Injectable, inject } from '@angular/core';
import { PizzaType } from '../../../settings/enums/pizza-type.enum';
import type { OutputSlice } from './output-field';
import type { IProcessor } from './processor.interface';
import { CalculatorConfigService } from '../calculator-config.service';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';

const READS = [] as const;
const WRITES = ['hydrationRatio'] as const;

type Reads = (typeof READS)[number];
type Writes = (typeof WRITES)[number];

@Injectable({ providedIn: 'root' })
export class HydrationProcessor implements IProcessor<Reads, Writes> {
  readonly reads = READS;
  readonly writes = WRITES;

  private readonly calculatorConfigService = inject(CalculatorConfigService);

  process(input: ICalculatorInput): OutputSlice<Writes> {
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
