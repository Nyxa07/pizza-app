import { Injectable } from '@angular/core';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import {
  IProcessor,
  PartialCalculatorOutput,
} from '../../interfaces/processor.interface';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';

@Injectable({
  providedIn: 'root',
})
export class PizzaBallsWeightProcessor implements IProcessor {
  process(
    input: ICalculatorInput,
    acc: PartialCalculatorOutput,
  ): PartialCalculatorOutput {
    return {
      pizzaBalls: {
        weight: input.pizzaWeight ?? this.computeFromPizzaType(input.pizzaType),
      },
    };
  }

  private computeFromPizzaType(pizzaType: PizzaType): number {
    switch (pizzaType) {
      case PizzaType.NEAPOLITAN:
        return 250;
      case PizzaType.ROMAN:
        return 180;
      default:
        return 250;
    }
  }
}
