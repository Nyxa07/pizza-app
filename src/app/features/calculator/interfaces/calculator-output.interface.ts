import { ITimingPart } from './timing.interface';

export interface Quantity extends ITimingPart {
  yeast: number;
  flour: number;
  water: number;
  salt: number;
  honey: number;
  oliveOil: number;
}

export interface ICalculatorOutput {
  total: Quantity;
  poolish: Quantity;
  dough: Quantity;
  pizzaBalls: ITimingPart & { weight: number };
  hydrationRatio: number;
}
