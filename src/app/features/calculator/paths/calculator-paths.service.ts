import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { CalculatorPath } from '../enums/calculator-path.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import type { IGuidedCalculatorDraft } from '../interfaces/guided-calculator-draft.interface';
import type { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import { DoughDefaultsService } from '../services/dough-defaults.service';
import { GUIDED_STEP_STORAGE_KEY } from './calculator-draft-storage.constants';
import { EXPERT_PATH } from './expert.path';
import { GUIDED_PATH } from './guided.path';
import { INTERMEDIATE_PATH } from './intermediate.path';
import type { PathDefinition } from './path-definition.interface';
import type {
  GuidedPathDraft,
  PathControls,
  PathDraft,
} from './path-draft.interface';

/** Every handle this module can hand out, before `for` narrows it to one. */
type AnyPathDraft =
  | GuidedPathDraft
  | PathDraft<IIntermediateCalculatorDraft>
  | PathDraft<ICalculatorInput>;

/**
 * A Draft, live: seeded from the Defaults, overlaid with what storage holds,
 * and kept inside the invariants of its path on every write.
 *
 * It reads at creation rather than on an `init()` call, so the value served
 * before anything is written is already the user's own Draft. Safe because
 * `provideAppInitializer` runs the preference migration before any component
 * bootstraps.
 */
class DraftHandle<T> implements PathDraft<T> {
  readonly draft$: Observable<T>;

  private readonly draft: BehaviorSubject<T>;
  private readonly resolved$: Observable<ICalculatorInput>;

  constructor(
    private readonly definition: PathDefinition<T>,
    protected readonly prefs: PrefsStorage,
    private readonly defaults: DoughDefaultsService,
  ) {
    // A stored Draft is complete — `persist` writes the whole object — so the
    // seed only ever covers a first run or a field added by a release.
    this.draft = new BehaviorSubject<T>(
      definition.normalize({
        ...definition.seed(defaults.getDefaults()),
        ...(prefs.get<T>(definition.storageKey) ?? {}),
      }),
    );
    this.draft$ = this.draft.asObservable();
    this.resolved$ = this.draft$.pipe(
      map((draft) => definition.toInput(draft, this.defaults.getDefaults())),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    // The invariant holds from the first read on, not from the first edit.
    this.persist(this.draft.value);
  }

  snapshot(): T {
    return this.draft.value;
  }

  update(partial: Partial<T>): void {
    this.persist({ ...this.draft.value, ...partial });
  }

  newCalculation(): void {
    this.persist(this.definition.seed(this.defaults.getDefaults()));
  }

  resolvedInput$(): Observable<ICalculatorInput> {
    return this.resolved$;
  }

  private persist(draft: T): void {
    const normalized = this.definition.normalize(draft);
    this.draft.next(normalized);
    this.prefs.set(this.definition.storageKey, normalized);
  }
}

/** The Guided handle, which also remembers the step the user stopped on. */
class GuidedDraftHandle
  extends DraftHandle<IGuidedCalculatorDraft>
  implements GuidedPathDraft
{
  readonly stepIndex$: Observable<number>;

  private readonly stepIndex: BehaviorSubject<number>;

  constructor(prefs: PrefsStorage, defaults: DoughDefaultsService) {
    super(GUIDED_PATH, prefs, defaults);
    this.stepIndex = new BehaviorSubject<number>(
      sanitizeStepIndex(prefs.get<unknown>(GUIDED_STEP_STORAGE_KEY)),
    );
    this.stepIndex$ = this.stepIndex.asObservable();
  }

  setStepIndex(index: number): void {
    const step = sanitizeStepIndex(index);
    this.stepIndex.next(step);
    this.prefs.set(GUIDED_STEP_STORAGE_KEY, step);
  }

  override newCalculation(): void {
    this.setStepIndex(0);
    super.newCalculation();
  }
}

/**
 * Only the lower bound is enforced here: the number of steps belongs to the
 * Guided form, which clamps the upper bound when it reads the stream.
 */
function sanitizeStepIndex(index: unknown): number {
  return typeof index === 'number' && Number.isInteger(index)
    ? Math.max(0, index)
    : 0;
}

/**
 * The single module holding every Draft (ADR-0003).
 *
 * It hands out one handle per path — the only way to read, edit or restart a
 * Draft — and it alone knows how a Draft is seeded, kept inside the bounds of
 * its style, and resolved into a complete engine input. Screens capture their
 * handle once and never name another path's Draft.
 *
 * Adding a path costs one {@link PathDefinition}: no new service, no adapter,
 * no registry entry.
 */
@Injectable({ providedIn: 'root' })
export class CalculatorPaths {
  private readonly prefs = inject(PrefsStorage);
  private readonly defaults = inject(DoughDefaultsService);

  /** Memoized: a handle reads storage once, at its creation. */
  private readonly handles = new Map<CalculatorPath, AnyPathDraft>();

  /**
   * The handle of one path, typed to that path.
   *
   * Asked for a path only known at runtime — the header reset button, the
   * Method screen — it narrows to {@link PathControls}: enough to restart a
   * calculation and to read its engine input, not enough to edit it.
   */
  for(path: CalculatorPath.GUIDED): GuidedPathDraft;
  for(
    path: CalculatorPath.INTERMEDIATE,
  ): PathDraft<IIntermediateCalculatorDraft>;
  for(path: CalculatorPath.EXPERT): PathDraft<ICalculatorInput>;
  for(path: CalculatorPath): PathControls;
  for(path: CalculatorPath): AnyPathDraft {
    const handle = this.handles.get(path) ?? this.create(path);
    this.handles.set(path, handle);

    return handle;
  }

  /**
   * Starts a calculation from a complete input the user did not type: the
   * « Ajuster » of a saved Dough, or the dough a Recipe suggests.
   *
   * Which Draft receives it is this module's business — that is the whole
   * point of the rule living here rather than in Doughs and in Recipes.
   */
  startFrom(input: ICalculatorInput): void {
    this.for(CalculatorPath.EXPERT).update({ ...input });
  }

  private create(path: CalculatorPath): AnyPathDraft {
    switch (path) {
      case CalculatorPath.GUIDED:
        return new GuidedDraftHandle(this.prefs, this.defaults);
      case CalculatorPath.INTERMEDIATE:
        return new DraftHandle(INTERMEDIATE_PATH, this.prefs, this.defaults);
      case CalculatorPath.EXPERT:
        return new DraftHandle(EXPERT_PATH, this.prefs, this.defaults);
    }
  }
}
