import { Injectable } from '@angular/core';
import { IProcessor } from '../../interfaces/processor.interface';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { DoughType } from '../../enums/dough-type.enum';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';

@Injectable({
  providedIn: 'root',
})
export class SimpleIngredientsProcessor implements IProcessor {
  process(input: ICalculatorInput, acc: { total: { flour: number } }) {
    const salt = input.saltRatio * acc.total.flour;
    const honey = input.honeyRatio * acc.total.flour;
    const oliveOil =
      input.pizzaType === PizzaType.NEAPOLITAN
        ? 0
        : input.oliveOilRatio * acc.total.flour;

    return {
      total: {
        salt,
        honey,
        oliveOil,
      },
      poolish: {
        honey: input.doughType === DoughType.POOLISH ? honey : 0,
      },
      dough: {
        salt,
        honey: input.doughType === DoughType.POOLISH ? 0 : honey,
        oliveOil,
      },
    };
  }
}
