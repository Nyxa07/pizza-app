import type { DoughType } from '../enums/dough-type.enum';

/** The grams a dough splits into, as the scale — and so the screen — reads them. */
export interface IDoughSplit {
  readonly flour: number;
  readonly water: number;
  readonly salt: number;
  readonly yeast: number;
}

/**
 * The figures every surface shows of a dough, fully resolved and carrying the
 * precision they are read with: a hydration is a whole percentage, a weight a
 * whole gram, a rest a whole hour, and the yeast its two decimals.
 *
 * One type serves the five surfaces. Each reads the fields that concern it and
 * ignores the others; they all come out of the same engine run, so two screens
 * cannot announce two different figures for the same dough.
 *
 * A `null` on an `ICalculatorInput` means « auto » — an engine contract, never
 * a display source. No field below is nullable.
 */
export interface IDoughFacts {
  /** Number of pizza balls. */
  readonly balls: number;
  /** Ball weight in whole grams, derived from the style when left on auto. */
  readonly ballWeight: number;
  /** Hydration as a whole percentage, as every screen prints it. */
  readonly hydrationPct: number;
  /**
   * The hydration ratio in `0..1` the engine resolved, unrounded — the one
   * raw figure this module publishes.
   *
   * It has a single caller: the Expert hydration step, which walks a grid of
   * hundredths. A resolved ratio can carry three decimals, and stepping from
   * {@link hydrationPct} would land off the grid and skip a value. It moves to
   * a calculator field model the day one exists.
   */
  readonly hydrationRatio: number;
  readonly doughType: DoughType;
  /** Room-temperature rest, in whole hours. */
  readonly ambientHours: number;
  /** Cold rest, in whole hours. */
  readonly coldHours: number;
  /**
   * `ambientHours + coldHours` — the sum of the two rests *as shown*, so a
   * surface printing the total and one printing the split cannot differ.
   */
  readonly restHours: number;
  /** Total dough weight in whole grams, every ingredient included. */
  readonly totalWeight: number;
  readonly split: IDoughSplit;
}
