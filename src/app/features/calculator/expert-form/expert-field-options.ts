import { range } from 'src/app/shared/helpers/range';

import { ICalculatorInput } from '../interfaces/calculator-input.interface';

/**
 * The value grids every steppable Expert tile walks through — the same
 * historic bounds the v1 selects offered. « Mes défauts de pâte » consumes
 * the shared entries too, so the two forms can never drift apart.
 */
export const EXPERT_FIELD_OPTIONS = {
  nbPizzas: range(1, 25),
  pizzaWeight: range(150, 400, 10),
  hydrationRatio: range(0.55, 0.8, 0.01, 2),
  poolishRatio: range(0.3, 0.6, 0.01, 2),
  saltRatio: range(0.02, 0.04, 0.001, 3),
  honeyRatio: range(0, 0.005, 0.001, 3),
  oliveOilRatio: range(0, 0.03, 0.001, 3),
  flourStrength: range(200, 400, 10),
  temperature: range(19, 36),
  rtRestTime: range(1, 24),
  coldRestTime: range(0, 48),
} as const;

/**
 * Next value of `values` above (or below) `current`. A Draft written by
 * another path may sit between two grid values or outside the bounds; the
 * step then lands on the nearest grid value in the pressed direction.
 */
export function stepInList(
  values: readonly number[],
  current: number,
  direction: 1 | -1,
): number {
  if (direction === 1) {
    return values.find((v) => v > current) ?? values[values.length - 1];
  }
  return [...values].reverse().find((v) => v < current) ?? values[0];
}

/**
 * Patch for editing one rest tile. The Draft may hold only a
 * globalRestTime (Guided path): both effective rest times get pinned and
 * the global rest is dropped, so the engine stops re-splitting it and the
 * screen keeps showing exactly what the user just set.
 */
export function restTimePatch(
  field: 'rtRestTime' | 'coldRestTime',
  value: number,
  effective: { rtRestTime: number; coldRestTime: number },
): Partial<ICalculatorInput> {
  return {
    rtRestTime: effective.rtRestTime,
    coldRestTime: effective.coldRestTime,
    [field]: value,
    globalRestTime: null,
  };
}
