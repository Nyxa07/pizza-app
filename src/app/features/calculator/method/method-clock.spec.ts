import { SystemMethodClock } from './method-clock';

/**
 * The adapter the app runs on. What it owes the user: the aperçu of a form
 * and the Method screen its CTA opens narrate one plan, not two.
 */
describe('SystemMethodClock', () => {
  // A minute before a quarter-hour: the aperçu says « poolish à 21:00 ».
  const APERCU_AT = new Date(2026, 6, 14, 20, 59);

  const at = (date: Date): void => {
    jasmine.clock().mockDate(date);
  };

  beforeEach(() => {
    jasmine.clock().install();
    at(APERCU_AT);
  });

  afterEach(() => jasmine.clock().uninstall());

  it('answers the same instant to the screen opened a minute later', () => {
    const clock = new SystemMethodClock();
    const apercu = clock.now();

    // The user reads the card, then taps « voir les 16 étapes ».
    at(new Date(2026, 6, 14, 21, 1));

    expect(clock.now()).toEqual(apercu);
  });

  it('re-reads the wall once the plan has aged past a grid step', () => {
    const clock = new SystemMethodClock();
    const apercu = clock.now();

    // Same calculation reopened the next morning: 21:00 is no longer a plan.
    const later = new Date(2026, 6, 15, 9, 30);
    at(later);

    expect(clock.now()).not.toEqual(apercu);
    expect(clock.now()).toEqual(later);
  });

  it('holds still right up to the step, and gives way on it', () => {
    const clock = new SystemMethodClock();
    const first = clock.now();

    at(new Date(APERCU_AT.getTime() + 15 * 60 * 1000 - 1));
    expect(clock.now()).toEqual(first);

    const onTheStep = new Date(APERCU_AT.getTime() + 15 * 60 * 1000);
    at(onTheStep);
    expect(clock.now()).toEqual(onTheStep);
  });

  it('hands out an instant no caller can move', () => {
    const clock = new SystemMethodClock();

    clock.now().setFullYear(1999);

    expect(clock.now()).toEqual(APERCU_AT);
  });
});
