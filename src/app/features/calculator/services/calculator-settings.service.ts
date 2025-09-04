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

export enum CALCULATOR_MODE {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorSettingsService {
  private mode: CALCULATOR_MODE = CALCULATOR_MODE.SIMPLE;
  private readonly STORAGE_KEY = 'calculator:settings';
  private readonly _state = new BehaviorSubject<ICalculatorSettings>(
    DEFAULT_SETTINGS,
  );

  constructor(
    private prefs: PrefsStorage,
    private injector: Injector,
  ) {}

  init(
    mode: CALCULATOR_MODE,
    defaultSettings?: Partial<ICalculatorSettings>,
  ): void {
    this.mode = mode;
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

  update(partial: Partial<ICalculatorSettings>): void {
    this._state.next({ ...this._state.value, ...partial });
    this.prefs.set(this.STORAGE_KEY + ':' + this.mode, {
      ...this._state.value,
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
