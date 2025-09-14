import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay, tap } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { CalculatorService } from './calculator.service';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import {
  CALCULATOR_MODE,
  CalculatorSettingsService,
} from './calculator-settings.service';
import { PizzaType } from '../../settings/enums/pizza-type.enum';

export interface CalculatorInput {
  nbPizzas: number;
  doughType: DoughType;
  yeastType: YeastType;
  hydrationRatio?: number;
  temperature: number;
  poolishRatio?: number;
  rtRestTime?: number;
  coldRestTime?: number;
  flourStrength: number;
  saltRatio: number;
  honeyRatio: number;
  pizzaWeight: number;
  pizzaType: PizzaType;
  oliveOilRatio: number;
}

export const DEFAULT_INPUT: CalculatorInput = {
  nbPizzas: 5,
  doughType: DoughType.DIRECT,
  yeastType: YeastType.DRY_ACTIVE,
  hydrationRatio: 0.62,
  temperature: 20,
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

export const DEFAULT_INPUTS: Record<PizzaType, CalculatorInput> = {
  [PizzaType.NEAPOLITAN]: {
    ...DEFAULT_INPUT,
    pizzaType: PizzaType.NEAPOLITAN,
    oliveOilRatio: 0,
    hydrationRatio: 0.6,
    pizzaWeight: 250,
  },
  [PizzaType.ROMAN]: {
    ...DEFAULT_INPUT,
    pizzaType: PizzaType.ROMAN,
    oliveOilRatio: 0.016,
    hydrationRatio: 0.55,
    pizzaWeight: 180,
  },
};

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private mode: CALCULATOR_MODE = CALCULATOR_MODE.SIMPLE;
  private readonly STORAGE_KEY = 'calculator';
  private readonly _input = new BehaviorSubject<CalculatorInput>(DEFAULT_INPUT);

  readonly input$ = this._input.asObservable();
  readonly result$ = this.input$.pipe(
    map((i) => this.computeInput(i)),
    map((i) => this.calculator.compute(i)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  private _initInput: CalculatorInput | null = null;

  constructor(
    private calculator: CalculatorService,
    private prefs: PrefsStorage,
    private settings: CalculatorSettingsService,
  ) {}

  getInput(): CalculatorInput {
    return this._input.value;
  }

  update(input: Partial<CalculatorInput>): void {
    this._input.next({
      ...this._input.value,
      ...input,
    } as CalculatorInput);
    this.prefs.set(this.STORAGE_KEY + ':' + this.mode, this._input.value);
  }

  computeInput(i: CalculatorInput): CalculatorInput {
    const settings = this.settings.getSettings();
    const pizzaType = i.pizzaType;
    const defaultInput = DEFAULT_INPUTS[pizzaType];
    return {
      nbPizzas: i.nbPizzas,
      pizzaType: i.pizzaType,
      temperature: i.temperature,
      rtRestTime: settings.rtRestTime.auto ? undefined : i.rtRestTime,
      doughType: settings.doughType.auto ? DoughType.DIRECT : i.doughType,
      yeastType: settings.yeastType.auto ? YeastType.DRY_ACTIVE : i.yeastType,
      hydrationRatio: settings.hydrationRatio.auto
        ? undefined
        : i.hydrationRatio,
      poolishRatio: settings.poolishRatio.auto
        ? defaultInput.poolishRatio
        : i.poolishRatio,
      flourStrength: settings.flourStrength.auto
        ? defaultInput.flourStrength
        : i.flourStrength,
      saltRatio: settings.saltRatio.auto ? defaultInput.saltRatio : i.saltRatio,
      honeyRatio: settings.honeyRatio.auto
        ? defaultInput.honeyRatio
        : i.honeyRatio,
      pizzaWeight: settings.pizzaWeight.auto
        ? defaultInput.pizzaWeight
        : i.pizzaWeight,
      coldRestTime: settings.coldRestTime.auto ? undefined : i.coldRestTime,
      oliveOilRatio: settings.oliveOilRatio.auto
        ? defaultInput.oliveOilRatio
        : i.oliveOilRatio,
    };
  }

  init(mode: CALCULATOR_MODE, input?: Partial<CalculatorInput>): void {
    this.mode = mode;
    // To be able to reset to default
    this._initInput = {
      ...DEFAULT_INPUT,
      ...input,
    } as CalculatorInput;

    // Will trigger auto computed inputs
    this.update({
      ...this._initInput,
      ...this.loadFromStorage(),
    });
  }

  resetField(field: keyof CalculatorInput): void {
    this.update({
      [field]: this._initInput?.[field] ?? DEFAULT_INPUT[field],
    });
  }

  reset(): void {
    this.update(this._initInput ?? DEFAULT_INPUT);
  }

  private loadFromStorage(): CalculatorInput | null {
    return this.prefs.get<CalculatorInput>(this.STORAGE_KEY + ':' + this.mode);
  }
}
