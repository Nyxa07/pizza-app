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

/** Every Path draft this module can hand out, before `for` narrows it to one. */
type AnyPathDraft =
  | GuidedPathDraft
  | PathDraft<IIntermediateCalculatorDraft>
  | PathDraft<ICalculatorInput>;

/**
 * A Path draft, live: seeded from the Defaults, overlaid with what storage
 * holds, and kept inside the invariants of its path on every write.
 *
 * It reads at creation rather than on an `init()` call, so the value served
 * before anything is written is already the user's own Draft. Safe because
 * `provideAppInitializer` runs the preference migration before any component
 * bootstraps.
 */
class PersistedPathDraft<T> implements PathDraft<T> {
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
    const resumed = definition.normalize({
      ...definition.seed(defaults.getDefaults()),
      ...(prefs.get<T>(definition.storageKey) ?? {}),
    });

    this.draft = new BehaviorSubject<T>(resumed);
    this.draft$ = this.draft.asObservable();
    this.resolved$ = this.draft$.pipe(
      map((draft) => definition.toInput(draft, this.defaults.getDefaults())),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    // The invariant holds from the first read on, not from the first edit.
    prefs.set(definition.storageKey, resumed);
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

  /**
   * Drops the calculation in progress for another one. Not on
   * {@link PathDraft}: only this module ever replaces a whole Draft, and it
   * seeds what the incoming one does not carry from « Mes pâtes par défaut »
   * rather than from the calculation being replaced.
   */
  replaceWith(draft: Partial<T>): void {
    this.persist({
      ...this.definition.seed(this.defaults.getDefaults()),
      ...draft,
    });
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

/** The Guided Path draft, which also remembers the step the user is on. */
class PersistedGuidedPathDraft
  extends PersistedPathDraft<IGuidedCalculatorDraft>
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
 * It hands out one Path draft per path — the only way to read, edit or
 * restart a Draft — and it alone knows how a Draft is seeded, kept inside the
 * bounds of its style, and resolved into a complete engine input. Screens
 * capture the Path draft of their own path and never name another's.
 *
 * A path is added by declaring one {@link PathDefinition}, which carries
 * everything the path decides: no new service, no adapter, no second place
 * where a domain rule lives.
 */
@Injectable({ providedIn: 'root' })
export class CalculatorPaths {
  private readonly prefs = inject(PrefsStorage);
  private readonly defaults = inject(DoughDefaultsService);

  // Memoized: a Path draft reads storage once, at its creation.
  private guided?: PersistedGuidedPathDraft;
  private intermediate?: PersistedPathDraft<IIntermediateCalculatorDraft>;
  private expert?: PersistedPathDraft<ICalculatorInput>;

  /**
   * The Path draft of one path, typed to that path.
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
    switch (path) {
      case CalculatorPath.GUIDED:
        return (this.guided ??= new PersistedGuidedPathDraft(
          this.prefs,
          this.defaults,
        ));
      case CalculatorPath.INTERMEDIATE:
        return (this.intermediate ??= new PersistedPathDraft(
          INTERMEDIATE_PATH,
          this.prefs,
          this.defaults,
        ));
      case CalculatorPath.EXPERT:
        return this.expertDraft();
    }
  }

  /**
   * Starts a calculation from a complete input the user did not type: the
   * « Ajuster » of a saved Dough, or the dough a Recipe suggests.
   *
   * Which Draft receives it is this module's business — that is the whole
   * point of the rule living here rather than in Doughs and in Recipes. The
   * copy is detached and it replaces the calculation in progress: a Dough
   * read back from storage may predate a field, and merging would leak the
   * current Draft into what the user asked to adjust.
   */
  startFrom(input: ICalculatorInput): void {
    this.expertDraft().replaceWith({ ...input });
  }

  /** The one path `startFrom` writes to, typed so it can be replaced. */
  private expertDraft(): PersistedPathDraft<ICalculatorInput> {
    return (this.expert ??= new PersistedPathDraft(
      EXPERT_PATH,
      this.prefs,
      this.defaults,
    ));
  }
}
