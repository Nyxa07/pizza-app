import type { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import type { OutputField, OutputSlice } from './output-field';

/**
 * One step of the engine: what it reads of the output built so far, what it
 * adds to it, and the computation in between.
 *
 * The two lists are the whole contract. The pipeline derives the running
 * order from them — a processor is declared, never placed — and hands each
 * one exactly the slice it asked for. Declaring them once, `as const`, and
 * deriving both type parameters from that declaration is what keeps the two
 * from drifting apart.
 */
export interface IProcessor<
  Reads extends OutputField = never,
  Writes extends OutputField = OutputField,
> {
  /** What this step needs; each of them must be written by another step. */
  readonly reads: readonly Reads[];

  /** What this step produces; no two steps may write the same field. */
  readonly writes: readonly Writes[];

  process(
    input: ICalculatorInput,
    acc: OutputSlice<Reads>,
  ): OutputSlice<Writes>;
}

/**
 * A processor as the pipeline sees it. The pipeline works from the two lists
 * and addresses every value by path, so it sees the slices it passes and
 * receives as plain records; each processor still checks its own against its
 * own declarations.
 */
export type AnyProcessor = {
  readonly reads: readonly OutputField[];
  readonly writes: readonly OutputField[];
  process(
    input: ICalculatorInput,
    acc: Record<string, unknown>,
  ): Record<string, unknown>;
};
