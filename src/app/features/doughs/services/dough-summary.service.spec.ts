import { TestBed } from '@angular/core/testing';

import { DoughType } from 'src/app/features/calculator/enums/dough-type.enum';
import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import { CalculatorConfigService } from 'src/app/features/calculator/services/calculator-config.service';
import { DoughDefaultsService } from 'src/app/features/calculator/services/dough-defaults.service';
import { GuidedDraftService } from 'src/app/features/calculator/services/guided-draft.service';
import { GuidedInputAdapter } from 'src/app/features/calculator/services/guided-input.adapter';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import type { Dough } from '../interfaces/dough.interface';

import { DoughSummaryService } from './dough-summary.service';

describe('DoughSummaryService (the displayable facts of a Dough)', () => {
  let service: DoughSummaryService;

  /** An input as the Guided path resolves it: every hidden field on auto. */
  const guidedInput = (): ICalculatorInput =>
    TestBed.inject(GuidedInputAdapter).resolve(
      TestBed.inject(GuidedDraftService).getDraft(),
    );

  /** An input as the Expert path holds it: every field materialised. */
  const expertInput = (
    partial: Partial<ICalculatorInput> = {},
  ): ICalculatorInput => ({
    ...TestBed.inject(DoughDefaultsService).getDefaults(),
    ...partial,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: new FakePrefsStorage() }],
    });
    service = TestBed.inject(DoughSummaryService);
  });

  it('resolves every fact of a Guided input, hydration included', () => {
    const input = guidedInput();
    expect(input.hydrationRatio)
      .withContext('the Guided path does not ask for hydration (ADR-0003)')
      .toBeNull();

    const summary = service.summarize(input);

    const bounds = TestBed.inject(CalculatorConfigService).constants
      .hydrationRecommendation[PizzaType.NEAPOLITAN];
    expect(summary.hydrationRatio).toBeGreaterThan(0);
    expect(summary.hydrationRatio).toBeGreaterThanOrEqual(bounds.minHydration);
    expect(summary.hydrationRatio).toBeLessThanOrEqual(bounds.maxHydration);
    for (const value of [
      summary.balls,
      summary.ballWeight,
      summary.ambientHours,
      summary.coldHours,
      summary.restHours,
    ]) {
      expect(Number.isFinite(value)).toBeTrue();
    }
    expect(summary.balls).toBe(input.nbPizzas);
    expect(summary.ballWeight).toBeGreaterThan(0);
    expect(summary.doughType).toBe(input.doughType);
  });

  it('keeps an hydration the user typed in Expert untouched', () => {
    const summary = service.summarize(expertInput({ hydrationRatio: 0.71 }));

    expect(summary.hydrationRatio).toBe(0.71);
  });

  it('resolves an Expert input left on auto hydration', () => {
    const summary = service.summarize(expertInput({ hydrationRatio: null }));

    expect(summary.hydrationRatio).toBeGreaterThan(0);
  });

  it('reads the rest split from the timing part matching the dough type', () => {
    const direct = service.summarize(
      expertInput({
        doughType: DoughType.DIRECT,
        globalRestTime: 24,
        rtRestTime: null,
        coldRestTime: null,
      }),
    );
    const poolish = service.summarize(
      expertInput({
        doughType: DoughType.POOLISH,
        globalRestTime: 24,
        rtRestTime: null,
        coldRestTime: null,
      }),
    );

    // Reading the wrong timing part would leave both hours at zero.
    expect(direct.restHours).toBe(24);
    expect(poolish.restHours).toBe(24);
    // A direct dough rests at room temperature; a poolish sends the bulk to the fridge.
    expect(direct.ambientHours).toBe(24);
    expect(direct.coldHours).toBe(0);
    expect(poolish.coldHours).toBeGreaterThan(0);
    expect(poolish.ambientHours).toBeGreaterThan(0);
  });

  it('never re-reads « my dough defaults » for an already saved input', () => {
    const input = guidedInput();
    const before = service.summarize(input);

    TestBed.inject(DoughDefaultsService).update({
      hydrationRatio: 0.8,
      pizzaWeight: 400,
      saltRatio: 0.05,
      globalRestTime: 72,
    });

    expect(service.summarize(input)).toEqual(before);
  });

  it('does not run the engine again for an unchanged document', () => {
    const dough: Dough = {
      id: 'dough-1',
      name: 'Samedi',
      input: guidedInput(),
      createdAt: '2026-07-26T10:00:00.000Z',
      updatedAt: '2026-07-26T10:00:00.000Z',
    };

    const first = service.forDough(dough);

    // Scrolling the library re-reads the same document: same instance back.
    expect(service.forDough({ ...dough })).toBe(first);
  });

  it('keeps every fact of a Dough intact across a rename', () => {
    const dough: Dough = {
      id: 'dough-1',
      name: 'Samedi',
      input: guidedInput(),
      createdAt: '2026-07-26T10:00:00.000Z',
      updatedAt: '2026-07-26T10:00:00.000Z',
    };

    const before = service.forDough(dough);
    const renamed = service.forDough({
      ...dough,
      name: 'Dimanche',
      updatedAt: '2026-07-26T11:00:00.000Z',
    });

    expect(renamed).toEqual(before);
  });
});
