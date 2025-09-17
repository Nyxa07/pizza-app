import { CalculatorStateService } from './calculator-state.service';
import { CalculatorSettingsService } from './calculator-settings.service';
import { Injectable } from '@angular/core';
import { CalculatorStateSaveManagerService } from './calculator-state-save-manager.service';
import { DoughType } from '../enums/dough-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CALCULATOR_MODE } from '../enums/calculator-mode.enum';
import { ICalculatorSettings } from '../interfaces/calculator-settings.interface';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { YeastType } from '../enums/yeast-type.enum';

export const DEFAULT_INPUT: ICalculatorInput = {
  nbPizzas: 5,
  doughType: DoughType.DIRECT,
  yeastType: YeastType.DRY_ACTIVE,
  hydrationRatio: 0.62,
  temperature: 20,
  globalRestTime: 24,
  rtRestTime: 16,
  coldRestTime: 0,
  poolishRatio: 0.4,
  flourStrength: 270,
  saltRatio: 0.028,
  honeyRatio: 0.004,
  pizzaWeight: 250,
  pizzaType: PizzaType.NEAPOLITAN,
  oliveOilRatio: 0,
};

@Injectable({
  providedIn: 'root',
})
export class CalculatorInitializerService {
  private _isInitialized = false;

  constructor(
    private calculatorState: CalculatorStateService,
    private calculatorSettings: CalculatorSettingsService,
    private calculatorStateSaveManager: CalculatorStateSaveManagerService,
  ) {}

  initSimple() {
    return this.init(CALCULATOR_MODE.SIMPLE, {
      settings: {
        saltRatio: { auto: true, visible: false },
        honeyRatio: { auto: true, visible: false },
        flourStrength: { auto: true, visible: false },
        hydrationRatio: { auto: true, visible: false },
        doughType: { auto: true, visible: false },
        poolishRatio: { auto: true, visible: false },
        yeastType: { auto: false, visible: true },
        coldRestTime: { auto: true, visible: false },
        globalRestTime: { auto: true, visible: false },
        pizzaWeight: { auto: true, visible: false },
        oliveOilRatio: { auto: true, visible: false },
      },
      input: DEFAULT_INPUT,
    });
  }

  initComplex() {
    this.init(CALCULATOR_MODE.COMPLEX, {
      settings: {
        pizzaWeight: { auto: false, visible: true },
        saltRatio: { auto: false, visible: true },
        honeyRatio: { auto: false, visible: true },
        flourStrength: { auto: false, visible: true },
        hydrationRatio: { auto: false, visible: true },
        doughType: { auto: false, visible: true },
        poolishRatio: { auto: false, visible: true },
        yeastType: { auto: false, visible: true },
        temperature: { auto: false, visible: true },
        rtRestTime: { auto: false, visible: true },
        coldRestTime: { auto: false, visible: true },
        globalRestTime: { auto: true, visible: false },
      },
      input: DEFAULT_INPUT,
    });
  }

  initAssisted() {
    this.init(CALCULATOR_MODE.ASSIST, {
      settings: {
        saltRatio: { auto: true, visible: false },
        honeyRatio: { auto: true, visible: false },
        flourStrength: { auto: false, visible: true },
        hydrationRatio: { auto: true, visible: false },
        doughType: { auto: false, visible: true },
        poolishRatio: { auto: true, visible: false },
        yeastType: { auto: false, visible: true },
        coldRestTime: { auto: true, visible: false },
        rtRestTime: { auto: true, visible: false },
        globalRestTime: { auto: false, visible: true },
        pizzaWeight: { auto: true, visible: false },
        oliveOilRatio: { auto: true, visible: false },
      },
      input: DEFAULT_INPUT,
    });
  }

  // Facade to init the calculator with a mode
  initWithMode(mode: CALCULATOR_MODE) {
    if (this._isInitialized) {
      return;
    }
    switch (mode) {
      case CALCULATOR_MODE.SIMPLE:
        this.initSimple();
        break;
      case CALCULATOR_MODE.COMPLEX:
        this.initComplex();
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
      input?: Partial<ICalculatorInput>;
    },
  ) {
    this.calculatorSettings.init(mode, options?.settings);
    this.calculatorState.init(mode, options?.input);
    this.calculatorStateSaveManager.init(mode);
    this._isInitialized = true;
  }
}
