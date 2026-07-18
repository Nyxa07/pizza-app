const QUARTER_HOUR_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * The Method's clock lands on quarter-hours — it narrates a plan, not a
 * stopwatch. Shared by the Expert preview and the full Method screen so
 * both always tell the same times.
 */
export function ceilToQuarterHour(date: Date): Date {
  return new Date(
    Math.ceil(date.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS,
  );
}

export function after(start: Date, hours: number): Date {
  return ceilToQuarterHour(new Date(start.getTime() + hours * HOUR_MS));
}
