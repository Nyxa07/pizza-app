import { MethodClock } from '../method/method-clock';

/**
 * The Method clock pinned to one instant, so a spec can assert on real dates
 * instead of on offsets. The test half of the seam {@link MethodClock} opens.
 *
 * Provide it with
 * `{ provide: MethodClock, useValue: new FixedMethodClock(instant) }`.
 */
export class FixedMethodClock extends MethodClock {
  constructor(private readonly instant: Date) {
    super();
  }

  now(): Date {
    return new Date(this.instant);
  }
}
