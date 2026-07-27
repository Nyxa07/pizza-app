import { Injectable } from '@angular/core';

const QUARTER_HOUR_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * When a Method starts counting.
 *
 * The seam exists so that no caller ever passes a time: the aperçu and the
 * full Method screen read the same clock through the same module, which is
 * the only way they can tell the same times. In the app it is the wall clock;
 * a spec pins it to an instant and asserts on real dates.
 */
@Injectable({
  providedIn: 'root',
  useFactory: () => new SystemMethodClock(),
})
export abstract class MethodClock {
  abstract now(): Date;
}

/** The wall clock — the only adapter the app ever runs on. */
export class SystemMethodClock extends MethodClock {
  now(): Date {
    return new Date();
  }
}

/**
 * The Method's clock lands on quarter-hours — it narrates a plan, not a
 * stopwatch. Which is also what keeps a wall clock from moving the times
 * under the user between two edits.
 */
export function ceilToQuarterHour(date: Date): Date {
  return new Date(
    Math.ceil(date.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS,
  );
}

export function after(start: Date, hours: number): Date {
  return ceilToQuarterHour(new Date(start.getTime() + hours * HOUR_MS));
}
