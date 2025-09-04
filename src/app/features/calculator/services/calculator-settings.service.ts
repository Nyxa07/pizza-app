import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { CalculatorStateService } from './calculator-state.service';
import { Injector } from '@angular/core';

export interface ICalculatorSettings {
  pizzaWeight: { auto: boolean; visible: boolean };
  saltRatio: { auto: boolean; visible: boolean };
  honeyRatio: { auto: boolean; visible: boolean };
  flourStrength: { auto: boolean; visible: boolean };
  hydrationRatio: { auto: boolean; visible: boolean };
  doughType: { auto: boolean; visible: boolean };
  poolishRatio: { auto: boolean; visible: boolean };
  yeastType: { auto: boolean; visible: boolean };
  temperature: { auto: boolean; visible: boolean };
  rtRestTime: { auto: boolean; visible: boolean };
  coldRestTime: { auto: boolean; visible: boolean };
}

const DEFAULT_SETTINGS: ICalculatorSettings = {
  pizzaWeight: { auto: false, visible: true },
  saltRatio: { auto: true, visible: false },
  honeyRatio: { auto: true, visible: false },
  flourStrength: { auto: true, visible: false },
  hydrationRatio: { auto: true, visible: false },
  doughType: { auto: false, visible: true },
  poolishRatio: { auto: false, visible: true },
  yeastType: { auto: false, visible: true },
  temperature: { auto: false, visible: true },
  rtRestTime: { auto: false, visible: true },
  coldRestTime: { auto: false, visible: true },
};

@Injectable({
  providedIn: 'root',
})
export class CalculatorSettingsService {
  private readonly STORAGE_KEY = 'calculator:settings';

  private readonly _state: {
    [key: string]: BehaviorSubject<ICalculatorSettings>;
  } = {};

  constructor(
    private prefs: PrefsStorage,
    private injector: Injector,
  ) {}

  init(key: string, defaultSettings?: Partial<ICalculatorSettings>): void {
    if (this._state[key]) {
      return;
    }
    this._state[key] = new BehaviorSubject<ICalculatorSettings>(
      this.prefs.get<ICalculatorSettings>(this.STORAGE_KEY + ':' + key) ?? {
        ...DEFAULT_SETTINGS,
        ...defaultSettings,
      },
    );
    this.prefs.set(this.STORAGE_KEY + ':' + key, this._state[key].value);
  }

  getSettings(key: string): ICalculatorSettings {
    this.init(key);
    return this._state[key].value;
  }

  getSettings$(key: string): Observable<ICalculatorSettings> {
    this.init(key);
    return this._state[key].asObservable();
  }

  update(key: string, partial: Partial<ICalculatorSettings>): void {
    this.init(key);
    this._state[key].next({ ...this._state[key].value, ...partial });
    this.prefs.set(this.STORAGE_KEY + ':' + key, {
      ...this._state[key].value,
      ...partial,
    });

    Object.keys(partial).forEach((key) => {
      const value = partial[key as keyof ICalculatorSettings];
      if (!value?.visible) {
        this.injector
          .get(CalculatorStateService)
          .resetField(key as keyof ICalculatorSettings);
      }
    });
  }
}
