import { TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { CalculatorPath } from '../enums/calculator-path.enum';
import { DoughDefaultsService } from '../services/dough-defaults.service';
import {
  EXPERT_DRAFT_STORAGE_KEY,
  GUIDED_DRAFT_STORAGE_KEY,
  GUIDED_STEP_STORAGE_KEY,
  INTERMEDIATE_DRAFT_STORAGE_KEY,
} from './calculator-draft-storage.constants';
import { CalculatorPaths } from './calculator-paths.service';
import type { PathDraft } from './path-draft.interface';

/** The complete engine input, sorted — what every path must resolve to. */
const ENGINE_INPUT_FIELDS = [
  'coldRestTime',
  'doughType',
  'flourStrength',
  'globalRestTime',
  'honeyRatio',
  'hydrationRatio',
  'nbPizzas',
  'oliveOilRatio',
  'pizzaType',
  'pizzaWeight',
  'poolishRatio',
  'rtRestTime',
  'saltRatio',
  'temperature',
  'yeastType',
].sort();

/**
 * The one answer the three Drafts share. Typing the shared suite against it
 * is not a shortcut: a `PathDraft<IGuidedCalculatorDraft>` is assignable to a
 * `PathDraft<CommonDraft>`, which is exactly the generic-but-not-editable
 * reading the module promises.
 */
interface CommonDraft {
  nbPizzas: number;
}

interface PathCase {
  readonly path: CalculatorPath;
  readonly storageKey: string;
  /** The typed handle, captured the way a screen captures it. */
  open(paths: CalculatorPaths): PathDraft<CommonDraft>;
  /** A stored Draft that breaks the path's own invariant, if it has one. */
  readonly stored: Record<string, unknown>;
  /** What the path must serve back, before anything is written. */
  readonly resumed: Record<string, unknown>;
}

const CASES: readonly PathCase[] = [
  {
    path: CalculatorPath.GUIDED,
    storageKey: GUIDED_DRAFT_STORAGE_KEY,
    open: (paths) => paths.for(CalculatorPath.GUIDED),
    // Guided asks nothing a style can invalidate: it resumes as stored.
    stored: { nbPizzas: 9 },
    resumed: { nbPizzas: 9 },
  },
  {
    path: CalculatorPath.INTERMEDIATE,
    storageKey: INTERMEDIATE_DRAFT_STORAGE_KEY,
    open: (paths) => paths.for(CalculatorPath.INTERMEDIATE),
    stored: { nbPizzas: 9, pizzaType: PizzaType.ROMAN, sizeCm: 35 },
    // 35 cm is a Neapolitan size; the Roman stops at 33.
    resumed: { nbPizzas: 9, sizeCm: 33 },
  },
  {
    path: CalculatorPath.EXPERT,
    storageKey: EXPERT_DRAFT_STORAGE_KEY,
    open: (paths) => paths.for(CalculatorPath.EXPERT),
    stored: { nbPizzas: 9, pizzaType: PizzaType.ROMAN, pizzaWeight: 340 },
    // 340 g is a 35 cm Neapolitan; the Roman tops out at 210 g.
    resumed: { nbPizzas: 9, pizzaWeight: 210 },
  },
];

/**
 * The single module holding every Draft (ADR-0003). The suite below runs the
 * same contract against the three paths; what each path decides for the user
 * lives in its own definition spec.
 */
describe('CalculatorPaths', () => {
  let prefs: FakePrefsStorage;
  let paths: CalculatorPaths;

  const configure = (): void => {
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    paths = TestBed.inject(CalculatorPaths);
  };

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    configure();
  });

  it('exposes the three paths of the v2 application', () => {
    expect(Object.values(CalculatorPath)).toEqual([
      CalculatorPath.GUIDED,
      CalculatorPath.INTERMEDIATE,
      CalculatorPath.EXPERT,
    ]);
  });

  for (const testCase of CASES) {
    describe(testCase.path, () => {
      it('hands out the same handle every time it is asked', () => {
        expect(testCase.open(paths)).toBe(testCase.open(paths));
      });

      it('resolves a complete engine input', async () => {
        const input = await firstValueFrom(
          testCase.open(paths).resolvedInput$(),
        );

        expect(input.nbPizzas).toBeGreaterThan(0);
        expect(input.pizzaType).toBe(PizzaType.NEAPOLITAN);
        // Every field is present: each path resolves its own input in full,
        // and none is left for the engine to fill in from the Defaults.
        expect(Object.keys(input).sort()).toEqual(ENGINE_INPUT_FIELDS);
      });

      it('serves the resumed Draft before anything is written to it', () => {
        prefs.set(testCase.storageKey, testCase.stored);
        TestBed.resetTestingModule();
        configure();

        // No init(): the very first read is already the user's own Draft,
        // brought inside the invariants of its path.
        expect(testCase.open(paths).snapshot()).toEqual(
          jasmine.objectContaining(testCase.resumed),
        );
      });

      it('persists every edit under its own key', () => {
        const draft = testCase.open(paths);

        draft.update({ nbPizzas: 3 });

        expect(draft.snapshot().nbPizzas).toBe(3);
        expect(prefs.get<CommonDraft>(testCase.storageKey)?.nbPizzas).toBe(3);
      });

      it('streams every edit, so a cached screen follows', async () => {
        const draft = testCase.open(paths);
        const seen: number[] = [];
        const subscription = draft.draft$.subscribe((value) =>
          seen.push(value.nbPizzas),
        );

        draft.update({ nbPizzas: 3 });
        draft.newCalculation();
        subscription.unsubscribe();

        expect(seen).toEqual([5, 3, 5]);
      });

      it('starts a new calculation from the current Defaults', () => {
        const draft = testCase.open(paths);
        draft.update({ nbPizzas: 9 });
        TestBed.inject(DoughDefaultsService).update({ nbPizzas: 3 });

        draft.newCalculation();

        expect(draft.snapshot().nbPizzas).toBe(3);
      });

      it('leaves the other calculations alone when it starts over', () => {
        for (const other of CASES) {
          other.open(paths).update({ nbPizzas: 9 });
        }

        testCase.open(paths).newCalculation();

        for (const other of CASES) {
          expect(other.open(paths).snapshot().nbPizzas)
            .withContext(other.path)
            .toBe(other.path === testCase.path ? 5 : 9);
        }
      });
    });
  }

  /** Only Guided resumes on a step; the two others answer in one screen. */
  describe('the Guided step', () => {
    /** The step through the stream, the only surface the Guided form reads. */
    const resumedStep = async (): Promise<number> => {
      TestBed.resetTestingModule();
      configure();
      return firstValueFrom(paths.for(CalculatorPath.GUIDED).stepIndex$);
    };

    it('resumes on the step the user stopped on', async () => {
      prefs.set(GUIDED_STEP_STORAGE_KEY, 5);

      expect(await resumedStep()).toBe(5);
    });

    it('persists the step and streams it, reset included', () => {
      const guided = paths.for(CalculatorPath.GUIDED);
      const seen: number[] = [];
      const subscription = guided.stepIndex$.subscribe((index) =>
        seen.push(index),
      );

      guided.setStepIndex(4);
      expect(prefs.get(GUIDED_STEP_STORAGE_KEY)).toBe(4);

      guided.newCalculation();
      subscription.unsubscribe();

      expect(seen).toEqual([0, 4, 0]);
      expect(prefs.get(GUIDED_STEP_STORAGE_KEY)).toBe(0);
    });

    it('falls back to the first step when the stored one is unusable', async () => {
      prefs.set(GUIDED_STEP_STORAGE_KEY, 'summary');
      expect(await resumedStep())
        .withContext('not a number')
        .toBe(0);

      prefs.set(GUIDED_STEP_STORAGE_KEY, -2);
      expect(await resumedStep())
        .withContext('negative')
        .toBe(0);
    });
  });

  describe('startFrom', () => {
    /** A saved Dough, or the dough a Recipe suggests. */
    const dough = () => ({
      ...TestBed.inject(DoughDefaultsService).getDefaults(),
      nbPizzas: 12,
      hydrationRatio: 0.71,
    });

    it('lands in the Draft the user can adjust in full', () => {
      paths.startFrom(dough());

      expect(paths.for(CalculatorPath.EXPERT).snapshot()).toEqual(
        jasmine.objectContaining({ nbPizzas: 12, hydrationRatio: 0.71 }),
      );
    });

    it('detaches the copy, so the source stays immutable', () => {
      const source = dough();

      paths.startFrom(source);
      source.nbPizzas = 2;

      expect(paths.for(CalculatorPath.EXPERT).snapshot().nbPizzas).toBe(12);
    });

    it('replaces the Draft rather than merging into it', () => {
      paths.for(CalculatorPath.EXPERT).update({ flourStrength: 350 });

      paths.startFrom(dough());

      expect(paths.for(CalculatorPath.EXPERT).snapshot().flourStrength).toBe(
        270,
      );
    });

    it('brings a weight from an older release inside its style', () => {
      paths.startFrom({
        ...dough(),
        pizzaType: PizzaType.ROMAN,
        pizzaWeight: 340,
      });

      expect(paths.for(CalculatorPath.EXPERT).snapshot().pizzaWeight).toBe(210);
    });

    it('leaves the approachable paths untouched', () => {
      paths.startFrom({ ...dough(), pizzaType: PizzaType.ROMAN });

      expect(paths.for(CalculatorPath.GUIDED).snapshot()).toEqual(
        jasmine.objectContaining({
          nbPizzas: 5,
          pizzaType: PizzaType.NEAPOLITAN,
        }),
      );
      expect(paths.for(CalculatorPath.INTERMEDIATE).snapshot()).toEqual(
        jasmine.objectContaining({
          nbPizzas: 5,
          pizzaType: PizzaType.NEAPOLITAN,
        }),
      );
    });
  });
});
