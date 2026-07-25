import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';

export const UNKNOWN_FLOUR_STRENGTH = 'unknown' as const;

export type GuidedFlourStrengthChoice =
  | typeof UNKNOWN_FLOUR_STRENGTH
  | 270
  | 300
  | 320
  | 350;

/**
 * The persisted answers owned by the Guided path.
 *
 * Technical inputs that the path does not expose deliberately do not belong
 * here: the Guided input adapter derives them without consulting Expert.
 */
export interface IGuidedCalculatorDraft {
  pizzaType: PizzaType;
  flourStrengthChoice: GuidedFlourStrengthChoice;
  nbPizzas: number;
  doughType: DoughType;
  globalRestTime: number;
  temperature: number;
  yeastType: YeastType;
}
