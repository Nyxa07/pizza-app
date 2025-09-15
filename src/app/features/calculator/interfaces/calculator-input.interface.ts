import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';

export interface ICalculatorInput {
  nbPizzas: number;
  doughType: DoughType;
  yeastType: YeastType;
  hydrationRatio: number | null;
  temperature: number;
  poolishRatio: number | null;
  globalRestTime: number | null;
  rtRestTime: number | null;
  coldRestTime: number | null;
  flourStrength: number;
  saltRatio: number;
  honeyRatio: number;
  pizzaWeight: number | null;
  pizzaType: PizzaType;
  oliveOilRatio: number | null;
}
