import type { Observable } from 'rxjs';

import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import type { IGuidedCalculatorDraft } from '../interfaces/guided-calculator-draft.interface';

/**
 * What a path exposes to code that does not know which path it holds — the
 * header reset button, the Method screen. Enough to drive a calculation, not
 * enough to edit one.
 *
 * `update` is deliberately out: the Guided Draft is a strict subset of the
 * Intermediate one, so a write typed against « some path » would accept six
 * fields out of seven belonging to another path without a compile error.
 */
export interface PathControls {
  /** Starts this path over from « Mes pâtes par défaut ». */
  newCalculation(): void;

  /** The complete engine input this path's Draft resolves to. */
  resolvedInput$(): Observable<ICalculatorInput>;
}

/**
 * The Draft of one path, typed to that path: what it holds, its edits, its
 * « Nouveau calcul » and its resolved engine input.
 *
 * Handed out by the Calculator paths module and captured once per screen, so
 * a value belonging to another path cannot be written into it (ADR-0003).
 */
export interface PathDraft<T> extends PathControls {
  /** The Draft as it stands, re-emitted on every edit and on every reset. */
  readonly draft$: Observable<T>;

  snapshot(): T;

  update(partial: Partial<T>): void;
}

/**
 * Guided alone resumes on the step the user stopped on — it is the only path
 * that asks one question at a time.
 *
 * Only the lower bound is enforced here: the number of steps belongs to the
 * Guided form, which clamps the upper bound when it reads this stream.
 */
export interface GuidedPathDraft extends PathDraft<IGuidedCalculatorDraft> {
  readonly stepIndex$: Observable<number>;

  setStepIndex(index: number): void;
}
