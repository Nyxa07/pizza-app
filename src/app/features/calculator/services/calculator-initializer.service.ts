import { CalculatorStateService } from './calculator-state.service';
import { CalculatorSettingsService } from './calculator-settings.service';
import { Injectable, inject } from '@angular/core';
import { CalculatorStateSaveManagerService } from './calculator-state-save-manager.service';
import { CALCULATOR_MODE } from '../enums/calculator-mode.enum';
import { ICalculatorSettings } from '../interfaces/calculator-settings.interface';

@Injectable({
  providedIn: 'root',
})
export class CalculatorInitializerService {
  private readonly calculatorState = inject(CalculatorStateService);
  private readonly calculatorSettings = inject(CalculatorSettingsService);
  private readonly calculatorStateSaveManager = inject(
    CalculatorStateSaveManagerService,
  );

  private _isInitialized = false;

  /**
   * The Expert path (issue #71): every field is explicit — whatever the
   * shared Draft holds passes through to the engine untouched, including a
   * globalRestTime written by the Guided path. COMPLEX stays as the
   * technical mode underneath: it keys the persisted saves silo (merged
   * into Doughs by #74) and the results/:mode URL (redesigned by #72).
   */
  initExpert() {
    this.init(CALCULATOR_MODE.COMPLEX, {
      settings: {
        pizzaWeight: { auto: false },
        saltRatio: { auto: false },
        honeyRatio: { auto: false },
        flourStrength: { auto: false },
        hydrationRatio: { auto: false },
        doughType: { auto: false },
        poolishRatio: { auto: false },
        yeastType: { auto: false },
        temperature: { auto: false },
        globalRestTime: { auto: false },
        rtRestTime: { auto: false },
        coldRestTime: { auto: false },
        oliveOilRatio: { auto: false },
      },
    });
  }

  initAssisted() {
    this.init(CALCULATOR_MODE.ASSIST, {
      settings: {
        saltRatio: { auto: true },
        honeyRatio: { auto: true },
        flourStrength: { auto: false },
        hydrationRatio: { auto: true },
        doughType: { auto: false },
        poolishRatio: { auto: true },
        yeastType: { auto: false },
        coldRestTime: { auto: true },
        rtRestTime: { auto: true },
        globalRestTime: { auto: false },
        pizzaWeight: { auto: true },
        oliveOilRatio: { auto: true },
      },
    });
  }

  // Facade to init the calculator behind a deep link (results/:mode); the
  // retired simple/complex modes resolve to the Expert configuration.
  initWithMode(mode: CALCULATOR_MODE) {
    if (this._isInitialized) {
      return;
    }
    switch (mode) {
      case CALCULATOR_MODE.SIMPLE:
      case CALCULATOR_MODE.COMPLEX:
        this.initExpert();
        break;
      case CALCULATOR_MODE.ASSIST:
        this.initAssisted();
        break;
    }
  }

  private init(
    mode: CALCULATOR_MODE,
    options?: {
      settings?: Partial<ICalculatorSettings>;
    },
  ) {
    this.calculatorSettings.init(options?.settings);
    this.calculatorState.init();
    this.calculatorStateSaveManager.init(mode);
    this._isInitialized = true;
  }
}
