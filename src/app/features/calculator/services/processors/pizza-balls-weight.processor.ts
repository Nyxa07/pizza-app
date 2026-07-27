import { Injectable } from '@angular/core';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { IProcessor, OutputSlice } from '../../interfaces/processor.interface';
import { clampWeight, fallbackWeight } from '../../pizza-format.model';

const READS = [] as const;
const WRITES = ['pizzaBalls.weight'] as const;

type Reads = (typeof READS)[number];
type Writes = (typeof WRITES)[number];

@Injectable({
  providedIn: 'root',
})
export class PizzaBallsWeightProcessor implements IProcessor<Reads, Writes> {
  readonly reads = READS;
  readonly writes = WRITES;

  /**
   * The ball weight, always inside what the style allows: an explicit weight
   * may come from a Draft or a Dough saved before the style bounds existed,
   * and the pizza format model is the only place that knows them.
   */
  process(
    input: ICalculatorInput,
    acc: OutputSlice<Reads>,
  ): OutputSlice<Writes> {
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
