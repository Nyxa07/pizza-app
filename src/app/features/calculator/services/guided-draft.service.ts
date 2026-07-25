import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import {
  IGuidedCalculatorDraft,
  UNKNOWN_FLOUR_STRENGTH,
} from '../interfaces/guided-calculator-draft.interface';
import {
  GUIDED_DRAFT_STORAGE_KEY,
  GUIDED_STEP_STORAGE_KEY,
} from './calculator-draft-storage.constants';
import { DoughDefaultsService } from './dough-defaults.service';

/** The persisted answers owned exclusively by the Guided path. */
@Injectable({ providedIn: 'root' })
export class GuidedDraftService {
  private readonly prefs = inject(PrefsStorage);
  private readonly defaults = inject(DoughDefaultsService);
  private readonly draft = new BehaviorSubject<IGuidedCalculatorDraft>(
    this.createSeed(),
  );

  getDraft(): IGuidedCalculatorDraft {
    return this.draft.value;
  }

  getDraft$(): Observable<IGuidedCalculatorDraft> {
    return this.draft.asObservable();
  }

  update(partial: Partial<IGuidedCalculatorDraft>): void {
    this.persist({ ...this.draft.value, ...partial });
  }

  init(): void {
    this.persist({
      ...this.createSeed(),
      ...(this.load() ?? {}),
    });
  }

  newCalculation(): void {
    this.prefs.remove(GUIDED_STEP_STORAGE_KEY);
    this.persist(this.createSeed());
  }

  private createSeed(): IGuidedCalculatorDraft {
    const defaults = this.defaults.getDefaults();
    const splitRestTime =
      (defaults.rtRestTime ?? 0) + (defaults.coldRestTime ?? 0);

    return {
      pizzaType: defaults.pizzaType,
      flourStrengthChoice: UNKNOWN_FLOUR_STRENGTH,
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

  private persist(draft: IGuidedCalculatorDraft): void {
    this.draft.next(draft);
    this.prefs.set(GUIDED_DRAFT_STORAGE_KEY, draft);
  }
}
