import type { DoughType } from '../../calculator/enums/dough-type.enum';

/**
 * The displayable facts of a Dough, fully resolved: no field is nullable.
 *
 * A `null` on an `ICalculatorInput` means « auto » — an engine contract, never
 * a display source (issue #94). Every surface that shows a Dough fact reads
 * this summary instead of the raw input.
 */
export interface DoughSummary {
  /** Number of pizza balls. */
  readonly balls: number;
  /** Ball weight in grams, defaulted from the pizza style when left on auto. */
  readonly ballWeight: number;
  /** Hydration ratio in `0..1`, always resolved. */
  readonly hydrationRatio: number;
  readonly doughType: DoughType;
  /** Room-temperature rest, in hours, from the engine. */
  readonly ambientHours: number;
  /** Cold rest, in hours, from the engine. */
  readonly coldHours: number;
  /** `ambientHours + coldHours`, for the surfaces showing a single total. */
  readonly restHours: number;
}
