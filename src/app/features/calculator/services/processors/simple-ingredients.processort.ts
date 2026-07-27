import { Injectable } from '@angular/core';
import type { OutputSlice } from './output-field';
import type { IProcessor } from './processor.interface';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { DoughType } from '../../enums/dough-type.enum';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';

const READS = ['total.flour'] as const;
const WRITES = [
  'total.salt',
  'total.honey',
  'total.oliveOil',
  'poolish.salt',
  'poolish.honey',
  'poolish.oliveOil',
  'dough.salt',
  'dough.honey',
  'dough.oliveOil',
] as const;

type Reads = (typeof READS)[number];
type Writes = (typeof WRITES)[number];

@Injectable({
  providedIn: 'root',
})
export class SimpleIngredientsProcessor implements IProcessor<Reads, Writes> {
  readonly reads = READS;
  readonly writes = WRITES;

  process(
    input: ICalculatorInput,
    acc: OutputSlice<Reads>,
  ): OutputSlice<Writes> {
    const salt = input.saltRatio * acc.total.flour;
    const honey = input.honeyRatio * acc.total.flour;
    const oliveOilRatio =
      input.oliveOilRatio ??
      this.computeOliveOilRatioFromPizzaType(input.pizzaType);
    const oliveOil = oliveOilRatio * acc.total.flour;

    return {
      total: {
        salt,
        honey,
        oliveOil,
      },
      poolish: {
        // A poolish is flour, water, yeast and — when it is the one fermenting
        // — the honey. Never the salt, which would inhibit it, never the oil.
        salt: 0,
        oliveOil: 0,
        honey: input.doughType === DoughType.POOLISH ? honey : 0,
      },
      dough: {
        salt,
        honey: input.doughType === DoughType.POOLISH ? 0 : honey,
        oliveOil,
      },
    };
  }

  computeOliveOilRatioFromPizzaType(pizzaType: PizzaType): number {
    switch (pizzaType) {
      case PizzaType.NEAPOLITAN:
        return 0;
      case PizzaType.ROMAN:
        return 0.016;
      default:
        return 0;
    }
  }
}
