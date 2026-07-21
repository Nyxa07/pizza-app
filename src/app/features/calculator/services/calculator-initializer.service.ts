import { Injectable, inject } from '@angular/core';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { ICalculatorSettings } from '../interfaces/calculator-settings.interface';
import { CalculatorSettingsService } from './calculator-settings.service';
import { CalculatorStateService } from './calculator-state.service';

/** Stable engine settings used by Expert and saved Dough documents. */
export const EXPERT_CALCULATOR_SETTINGS: ICalculatorSettings = {
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
};

@Injectable({
  providedIn: 'root',
})
export class CalculatorInitializerService {
  private readonly calculatorState = inject(CalculatorStateService);
  private readonly calculatorSettings = inject(CalculatorSettingsService);
  private activePath: CalculatorPath | null = null;

  /**
   * The Expert path (issue #71): every field is explicit — whatever the
   * shared Draft holds passes through to the engine untouched, including a
   * globalRestTime written by the Guided path.
   */
  initExpert(): void {
    this.init(CalculatorPath.EXPERT, {
      settings: EXPERT_CALCULATOR_SETTINGS,
    });
  }

  /** The Guided path only asks for fields a beginner can answer plainly. */
  initGuided(): void {
    this.init(CalculatorPath.GUIDED, {
      settings: {
        saltRatio: { auto: true },
        honeyRatio: { auto: true },
        flourStrength: { auto: false },
        hydrationRatio: { auto: true },
        doughType: { auto: false },
        poolishRatio: { auto: true },
        yeastType: { auto: false },
        // A Draft coming from Expert can carry an explicit ambient/cold
        // split instead of a global rest. Keep either representation live.
        coldRestTime: { auto: false },
        rtRestTime: { auto: false },
        globalRestTime: { auto: false },
        pizzaWeight: { auto: true },
        oliveOilRatio: { auto: true },
      },
    });
  }

  /** Deep-linked Methods use Expert settings unless a path is already active. */
  initMethod(): void {
    if (this.activePath === null) {
      this.initExpert();
    }
  }

  private init(
    path: CalculatorPath,
    options?: {
      settings?: Partial<ICalculatorSettings>;
    },
  ): void {
    this.calculatorSettings.init(options?.settings);
    this.calculatorState.init();
    this.activePath = path;
  }
}
