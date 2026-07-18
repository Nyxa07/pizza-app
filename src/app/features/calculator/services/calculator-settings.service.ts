import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ICalculatorSettings } from '../interfaces/calculator-settings.interface';

const DEFAULT_SETTINGS: ICalculatorSettings = {
  pizzaWeight: { auto: false },
  saltRatio: { auto: true },
  honeyRatio: { auto: true },
  flourStrength: { auto: true },
  hydrationRatio: { auto: true },
  doughType: { auto: false },
  poolishRatio: { auto: false },
  yeastType: { auto: false },
  temperature: { auto: false },
  globalRestTime: { auto: true },
  rtRestTime: { auto: false },
  coldRestTime: { auto: false },
  oliveOilRatio: { auto: false },
};

/**
 * The engine's auto-field map for the active calculator path. Fixed at
 * init time by the entering page — no longer user-personalised nor
 * persisted since the field-visibility screen was removed (issue #71);
 * the stale `calculator:settings:<mode>` keys are purged by migration.
 */
@Injectable({
  providedIn: 'root',
})
export class CalculatorSettingsService {
  private readonly _state = new BehaviorSubject<ICalculatorSettings>(
    DEFAULT_SETTINGS,
  );

  init(defaultSettings?: Partial<ICalculatorSettings>): void {
    this._state.next({
      ...DEFAULT_SETTINGS,
      ...defaultSettings,
    });
  }

  getSettings(): ICalculatorSettings {
    return this._state.value;
  }

  getSettings$(): Observable<ICalculatorSettings> {
    return this._state.asObservable();
  }
}
