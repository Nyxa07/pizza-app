import type { ICalculatorInput } from './calculator-input.interface';
import type { ICalculatorOutput } from './calculator-output.interface';

/** The output keys holding a group of values rather than a single one. */
type OutputGroup = Extract<
  {
    [K in keyof ICalculatorOutput]: ICalculatorOutput[K] extends object
      ? K
      : never;
  }[keyof ICalculatorOutput],
  string
>;

type GroupLeaf<G extends OutputGroup> = Extract<
  keyof ICalculatorOutput[G],
  string
>;

/**
 * One value of the engine output, addressed by path — `hydrationRatio`,
 * `total.flour`, `pizzaBalls.weight`.
 *
 * This is the vocabulary a processor declares its dependencies in, and it is
 * derived from {@link ICalculatorOutput}: a value added there is immediately
 * addressable, and one renamed turns every stale declaration into a compile
 * error instead of a silent `undefined`.
 */
export type OutputField =
  | Extract<Exclude<keyof ICalculatorOutput, OutputGroup>, string>
  | { [G in OutputGroup]: `${G}.${GroupLeaf<G>}` }[OutputGroup];

type GroupsIn<F extends OutputField> = F extends `${infer G}.${string}`
  ? G
  : never;

type LeavesIn<
  F extends OutputField,
  G extends OutputGroup,
> = F extends `${G}.${infer L}` ? L : never;

/**
 * Exactly what a set of fields amounts to, as an object.
 *
 * A processor sees this and nothing else of the output built so far: reading
 * a field it did not declare does not compile, so no dependency can escape
 * the graph the running order is derived from.
 */
export type OutputSlice<F extends OutputField> = {
  [G in GroupsIn<F> & OutputGroup]: {
    [L in LeavesIn<F, G> & keyof ICalculatorOutput[G]]: ICalculatorOutput[G][L];
  };
} & {
  [K in Extract<F, keyof ICalculatorOutput>]: ICalculatorOutput[K];
};

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

/**
 * The engine output, field by field, at runtime. Exhaustive by construction:
 * `satisfies` requires one entry per field of {@link ICalculatorOutput}, so a
 * field added there without a step to write it fails the build rather than
 * reaching a screen as `undefined`.
 */
const OUTPUT_SHAPE = {
  hydrationRatio: true,
  total: {
    yeast: true,
    flour: true,
    water: true,
    salt: true,
    honey: true,
    oliveOil: true,
    coldRestTime: true,
    rtRestTime: true,
    prepTime: true,
  },
  poolish: {
    yeast: true,
    flour: true,
    water: true,
    salt: true,
    honey: true,
    oliveOil: true,
    coldRestTime: true,
    rtRestTime: true,
    prepTime: true,
  },
  dough: {
    yeast: true,
    flour: true,
    water: true,
    salt: true,
    honey: true,
    oliveOil: true,
    coldRestTime: true,
    rtRestTime: true,
    prepTime: true,
  },
  pizzaBalls: {
    weight: true,
    coldRestTime: true,
    rtRestTime: true,
    prepTime: true,
  },
} satisfies {
  [K in keyof ICalculatorOutput]: ICalculatorOutput[K] extends object
    ? { [L in keyof ICalculatorOutput[K]]: true }
    : true;
};

/** Every field of the engine output — what the processors must cover. */
export const OUTPUT_FIELDS: readonly OutputField[] = Object.entries(
  OUTPUT_SHAPE,
).flatMap(([key, leaves]) =>
  leaves === true
    ? [key as OutputField]
    : Object.keys(leaves).map((leaf) => `${key}.${leaf}` as OutputField),
);
