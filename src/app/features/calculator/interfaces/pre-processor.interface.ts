import { ICalculatorInput } from './calculator-input.interface';
import { ICalculatorSettings } from './calculator-settings.interface';

export interface IPreProcessor<
  In = ICalculatorInput,
  Set = ICalculatorSettings,
  Prev extends Partial<In> = Partial<In>,
  Add extends Partial<In> = Partial<In>,
> {
  process(settings: Set, input: In, acc?: Prev): Prev & Add;
}
