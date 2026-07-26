import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';

/**
 * The persisted answers owned by the Guided path.
 *
 * Technical inputs that the path does not expose deliberately do not belong
 * here: the Guided input adapter derives them without consulting Expert.
 *
 * The flour strength left this Draft with its step (issue #99): the W value is
 * absent from most flour bags, so nearly every answer was « Je ne sais pas » —
 * which applied W270 anyway. Expert stays the one place to choose a flour.
 */
export interface IGuidedCalculatorDraft {
  pizzaType: PizzaType;
  nbPizzas: number;
  doughType: DoughType;
  globalRestTime: number;
  temperature: number;
  yeastType: YeastType;
}
