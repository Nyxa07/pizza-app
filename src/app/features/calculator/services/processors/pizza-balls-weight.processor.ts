import { Injectable } from '@angular/core';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import {
  IProcessor,
  PartialCalculatorOutput,
} from '../../interfaces/processor.interface';
import { clampWeight, fallbackWeight } from '../../pizza-format.model';

@Injectable({
  providedIn: 'root',
})
export class PizzaBallsWeightProcessor implements IProcessor {
  /**
   * The ball weight, always inside what the style allows: an explicit weight
   * may come from a Draft or a Dough saved before the style bounds existed,
   * and the pizza format model is the only place that knows them.
   */
  process(
    input: ICalculatorInput,
    acc: PartialCalculatorOutput,
  ): PartialCalculatorOutput {
    return {
      pizzaBalls: {
        weight:
          input.pizzaWeight === null
            ? fallbackWeight(input.pizzaType)
            : clampWeight(input.pizzaType, input.pizzaWeight),
      },
    };
  }
}
