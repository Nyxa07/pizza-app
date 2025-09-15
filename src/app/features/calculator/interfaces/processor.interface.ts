import { ICalculatorInput } from './calculator-input.interface';
import { ICalculatorOutput } from './calculator-output.interface';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PartialCalculatorOutput = DeepPartial<ICalculatorOutput>;

/**
 * Generic strongly-typed processor contract used by every processor.
 *  - In   : immutable calculator input (same for all processors)
 *  - Prev : accumulator before this processor runs
 *  - Add  : fragment guaranteed to be added by this processor
 *
 * All type parameters are optional so legacy processors that do not declare
 * them explicitly still compile. The second parameter `acc` is optional for
 * processors that only read `input`.
 */
export interface IProcessor<
  In = ICalculatorInput,
  Prev extends PartialCalculatorOutput = PartialCalculatorOutput,
  Add extends PartialCalculatorOutput = PartialCalculatorOutput,
> {
  process(input: In, acc?: Prev): Prev & Add;
}
