/**
 * Inclusive numeric range for select options, rounded to `decimal` places
 * so option values stay exact (`range(0.02, 0.04, 0.001, 3)` → 0.02 … 0.04).
 */
export function range(
  start: number,
  end: number,
  step: number = 1,
  decimal: number = 0,
): number[] {
  return Array.from(
    { length: (end - start) / step + 1 },
    (_, i) => Math.round((start + i * step) * 10 ** decimal) / 10 ** decimal,
  );
}
