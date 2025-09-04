import {
  CalculatorInput,
  CalculatorStateService,
} from './calculator-state.service';
import {
  CALCULATOR_MODE,
  CalculatorSettingsService,
  ICalculatorSettings,
} from './calculator-settings.service';
import { Injectable } from '@angular/core';
import { CalculatorStateSaveManagerService } from './calculator-state-save-manager.service';

@Injectable({
  providedIn: 'root',
})
export class CalculatorInitializerService {
  constructor(
    private calculatorState: CalculatorStateService,
    private calculatorSettings: CalculatorSettingsService,
    private calculatorStateSaveManager: CalculatorStateSaveManagerService,
  ) {}

  init(
    mode: CALCULATOR_MODE,
    options?: {
      settings?: Partial<ICalculatorSettings>;
      input?: Partial<CalculatorInput>;
    },
  ) {
    this.calculatorSettings.init(mode, options?.settings);
    this.calculatorState.init(mode, options?.input);
    this.calculatorStateSaveManager.init(mode);
  }
}
