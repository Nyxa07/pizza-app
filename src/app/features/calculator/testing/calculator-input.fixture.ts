import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';

import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';

/**
 * A complete engine input, as a Path draft resolves one. Specs that need
 * quantities and timings start from this and let the engine derive them —
 * hand-written outputs re-encode the engine's rules and drift from them.
 *
 * Five 250 g Neapolitan balls at 62 %, poolish at 40 %, 16 h ambient then
 * 8 h in the fridge.
 */
export const POOLISH_INPUT: ICalculatorInput = {
  nbPizzas: 5,
  doughType: DoughType.POOLISH,
  yeastType: YeastType.DRY_ACTIVE,
  hydrationRatio: 0.62,
  temperature: 20,
  poolishRatio: 0.4,
  globalRestTime: null,
  rtRestTime: 16,
  coldRestTime: 8,
  flourStrength: 270,
  saltRatio: 0.028,
  honeyRatio: 0.004,
  pizzaWeight: 250,
  pizzaType: PizzaType.NEAPOLITAN,
  oliveOilRatio: 0,
};

/** The same five pizzas as a direct dough, 8 h at ambient and no fridge. */
export const DIRECT_INPUT: ICalculatorInput = {
  ...POOLISH_INPUT,
  doughType: DoughType.DIRECT,
  poolishRatio: null,
  rtRestTime: 8,
  coldRestTime: 0,
};

export function inputWith(
  overrides: Partial<ICalculatorInput> = {},
): ICalculatorInput {
  return { ...POOLISH_INPUT, ...overrides };
}
