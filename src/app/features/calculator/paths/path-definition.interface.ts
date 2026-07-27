import type { ICalculatorInput } from '../interfaces/calculator-input.interface';

/**
 * Everything one calculator path is, declared in a single object: where its
 * Draft lives, what a new calculation starts from, what keeps that Draft
 * valid, and how it becomes a complete engine input.
 *
 * A path is added by writing one of these — no new service, no new adapter,
 * no registry entry. Nothing here is injectable on purpose: a definition is a
 * pure value, so a path's domain decisions are testable without a TestBed.
 */
export interface PathDefinition<T> {
  /** The preference key this path's Draft lives under. Never shared. */
  readonly storageKey: string;

  /** What « Nouveau calcul » starts from, read off « Mes pâtes par défaut ». */
  seed(defaults: ICalculatorInput): T;

  /**
   * The invariants of the path, applied to everything that enters the Draft:
   * the seed, what storage hands back, an edit, an « Ajuster ». Idempotent,
   * so re-reading a Draft never moves it.
   */
  normalize(draft: T): T;

  /**
   * The complete engine input this Draft amounts to — where a path resolves
   * what it deliberately does not ask the user, without ever consulting
   * another path's Draft (ADR-0003).
   */
  toInput(draft: T, defaults: ICalculatorInput): ICalculatorInput;
}
