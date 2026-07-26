import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { IGuidedCalculatorDraft } from '../interfaces/guided-calculator-draft.interface';
import {
  GUIDED_DRAFT_STORAGE_KEY,
  GUIDED_STEP_STORAGE_KEY,
} from './calculator-draft-storage.constants';
import { DoughDefaultsService } from './dough-defaults.service';

/**
 * The persisted answers owned exclusively by the Guided path, plus the step
 * the user stopped on: both are streamed from here so that a reset reaches
 * every consumer, including a Guided form still cached in the router-outlet.
 */
@Injectable({ providedIn: 'root' })
export class GuidedDraftService {
  private readonly prefs = inject(PrefsStorage);
  private readonly defaults = inject(DoughDefaultsService);
  private readonly draft = new BehaviorSubject<IGuidedCalculatorDraft>(
    this.createSeed(),
  );
  private readonly stepIndex = new BehaviorSubject<number>(
    this.loadStepIndex(),
  );

  getDraft(): IGuidedCalculatorDraft {
    return this.draft.value;
  }

  getDraft$(): Observable<IGuidedCalculatorDraft> {
    return this.draft.asObservable();
  }

  getStepIndex$(): Observable<number> {
    return this.stepIndex.asObservable();
  }

  setStepIndex(index: number): void {
    const step = this.sanitizeStepIndex(index);
    this.stepIndex.next(step);
    this.prefs.set(GUIDED_STEP_STORAGE_KEY, step);
  }

  update(partial: Partial<IGuidedCalculatorDraft>): void {
    this.persist({ ...this.draft.value, ...partial });
  }

  init(): void {
    this.persist({
      ...this.createSeed(),
      ...(this.load() ?? {}),
    });
    this.stepIndex.next(this.loadStepIndex());
  }

  newCalculation(): void {
    this.setStepIndex(0);
    this.persist(this.createSeed());
  }

  private createSeed(): IGuidedCalculatorDraft {
    const defaults = this.defaults.getDefaults();
    const splitRestTime =
      (defaults.rtRestTime ?? 0) + (defaults.coldRestTime ?? 0);

    return {
      pizzaType: defaults.pizzaType,
      nbPizzas: defaults.nbPizzas,
      doughType: defaults.doughType,
      globalRestTime: defaults.globalRestTime ?? splitRestTime,
      temperature: defaults.temperature,
      yeastType: defaults.yeastType,
    };
  }

  private load(): IGuidedCalculatorDraft | null {
    return this.prefs.get<IGuidedCalculatorDraft>(GUIDED_DRAFT_STORAGE_KEY);
  }

  private loadStepIndex(): number {
    return this.sanitizeStepIndex(
      this.prefs.get<unknown>(GUIDED_STEP_STORAGE_KEY),
    );
  }

  /**
   * Only the lower bound is enforced here: the number of steps belongs to the
   * Guided form, which clamps the upper bound when it reads this stream.
   */
  private sanitizeStepIndex(index: unknown): number {
    return typeof index === 'number' && Number.isInteger(index)
      ? Math.max(0, index)
      : 0;
  }

  private persist(draft: IGuidedCalculatorDraft): void {
    this.draft.next(draft);
    this.prefs.set(GUIDED_DRAFT_STORAGE_KEY, draft);
  }
}
