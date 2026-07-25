import type { ICalculatorInput } from '../../calculator/interfaces/calculator-input.interface';

/**
 * A named calculator snapshot opened as a document (ADR-0002).
 * Its input is immutable from the outside: editing happens only after an
 * explicit copy into the Expert Draft through « Adjust ».
 */
export interface Dough {
  readonly id: string;
  readonly name: string;
  readonly input: ICalculatorInput;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}
