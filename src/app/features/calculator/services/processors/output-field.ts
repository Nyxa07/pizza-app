import type { ICalculatorOutput } from '../../interfaces/calculator-output.interface';

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

/** The fields every quantity of the output is made of. */
const QUANTITY = {
  yeast: true,
  flour: true,
  water: true,
  salt: true,
  honey: true,
  oliveOil: true,
  coldRestTime: true,
  rtRestTime: true,
  prepTime: true,
} as const;

/**
 * The engine output, field by field, at runtime. Exhaustive by construction:
 * `satisfies` requires one entry per field of {@link ICalculatorOutput}, so a
 * field added there without a step to write it fails the build rather than
 * reaching a screen as `undefined`.
 */
const OUTPUT_SHAPE = {
  hydrationRatio: true,
  total: QUANTITY,
  poolish: QUANTITY,
  dough: QUANTITY,
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

/** The value a path points at, or `undefined` if nothing wrote it yet. */
export function readField(
  source: Record<string, unknown>,
  field: OutputField,
): unknown {
  const dot = field.indexOf('.');
  if (dot === -1) {
    return source[field];
  }
  const group = source[field.slice(0, dot)] as
    | Record<string, unknown>
    | undefined;
  return group?.[field.slice(dot + 1)];
}

/** Sets the value a path points at, creating the group it belongs to. */
export function writeField(
  target: Record<string, unknown>,
  field: OutputField,
  value: unknown,
): void {
  const dot = field.indexOf('.');
  if (dot === -1) {
    target[field] = value;
    return;
  }
  const name = field.slice(0, dot);
  const group = (target[name] ?? {}) as Record<string, unknown>;
  group[field.slice(dot + 1)] = value;
  target[name] = group;
}
