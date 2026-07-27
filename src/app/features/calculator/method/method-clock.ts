import { Injectable } from '@angular/core';

const QUARTER_HOUR_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * When a Method starts counting.
 *
 * The seam exists so that no caller ever passes a time: the aperçu and the
 * full Method screen read the same clock through the same module, which is
 * the only way they can tell the same times. In the app it is the wall clock
 * held still (see {@link SystemMethodClock}); a spec pins it to an instant
 * and asserts on real dates.
 */
@Injectable({
  providedIn: 'root',
  useFactory: () => new SystemMethodClock(),
})
export abstract class MethodClock {
  abstract now(): Date;
}

/**
 * The wall clock, held still for one step of the grid — the only adapter the
 * app ever runs on.
 *
 * Read twice inside that step — the aperçu of a form, then the Method screen
 * its CTA opens — it answers the same instant, so the two narrate one plan.
 * Reading the wall each time would break exactly that promise for the user
 * who taps « voir les 16 étapes » a minute after 21:00. Past a step the plan
 * is genuinely out of date, and re-reading is the honest answer.
 */
export class SystemMethodClock extends MethodClock {
  private pinned = new Date();

  now(): Date {
    const wall = new Date();

    if (wall.getTime() - this.pinned.getTime() >= QUARTER_HOUR_MS) {
      this.pinned = wall;
    }

    return new Date(this.pinned);
  }
}

/**
 * The Method's clock lands on quarter-hours — it narrates a plan, not a
 * stopwatch.
 */
export function ceilToQuarterHour(date: Date): Date {
  return new Date(
    Math.ceil(date.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS,
  );
}

export function after(start: Date, hours: number): Date {
  return ceilToQuarterHour(new Date(start.getTime() + hours * HOUR_MS));
}
