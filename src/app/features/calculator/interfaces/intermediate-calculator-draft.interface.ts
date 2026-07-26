import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';

/**
 * The persisted answers owned by the Intermediate path — only what the screen
 * asks, never a derived technical value.
 *
 * The ball weight is deliberately absent: the size is the answer, the weight
 * is its consequence. Changing the style therefore changes the weight without
 * the user retouching anything.
 */
export interface IIntermediateCalculatorDraft {
  pizzaType: PizzaType;
  nbPizzas: number;
  /** Diameter in centimetres, inside the range of the style (format model). */
  sizeCm: number;
  doughType: DoughType;
  /** Total rest in hours, the single slider this path exposes. */
  globalRestTime: number;
  temperature: number;
  yeastType: YeastType;
}
