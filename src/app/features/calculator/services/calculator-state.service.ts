import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { DoughDefaultsService } from './dough-defaults.service';

/**
 * The single Draft (« Calcul en cours ») — one in-progress calculation,
 * shared by every calculator path and persisted automatically (ADR-0002).
 * It survives restarts and is only ever replaced by an explicit act:
 * `newCalculation()`.
 */
@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private readonly DRAFT_KEY = 'calculator:draft';
  private readonly GUIDED_STEP_KEY = 'calculator:guided:step';
  private readonly prefs = inject(PrefsStorage);
  private readonly defaults = inject(DoughDefaultsService);
  private readonly _input = new BehaviorSubject<ICalculatorInput>(
    this.defaults.getDefaults(),
  );

  getInput(): ICalculatorInput {
    return this._input.value;
  }

  getInput$(): Observable<ICalculatorInput> {
    return this._input.asObservable();
  }

  update(input: Partial<ICalculatorInput>): void {
    this._input.next({ ...this._input.value, ...input });
    this.prefs.set(this.DRAFT_KEY, this._input.value);
  }

  /**
   * Resumes the persisted Draft; a brand-new user starts from their
   * Defaults. Called once by every calculator page (« Reprendre »).
   */
  init(): void {
    // Will trigger auto computed inputs
    this.update({
      ...this.defaults.getDefaults(),
      ...(this.loadDraft() ?? {}),
    });
  }

  /** Explicitly abandons the Draft and starts over from the user Defaults. */
  newCalculation(): void {
    this.prefs.remove(this.GUIDED_STEP_KEY);
    this.update(this.defaults.getDefaults());
  }

  resetField(field: keyof ICalculatorInput): void {
    this.update({
      [field]: this.defaults.getDefaults()[field],
    });
  }

  private loadDraft(): ICalculatorInput | null {
    return this.prefs.get<ICalculatorInput>(this.DRAFT_KEY);
  }
}
