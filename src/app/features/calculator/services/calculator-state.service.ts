import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CALCULATOR_MODE } from '../enums/calculator-mode.enum';

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

export const DEFAULT_INPUTS: Record<PizzaType, ICalculatorInput> = {
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
  private readonly _input = new BehaviorSubject<ICalculatorInput>(
    DEFAULT_INPUT,
  );

  private _initInput: ICalculatorInput | null = null;

  constructor(private prefs: PrefsStorage) {}

  getInput(): ICalculatorInput {
    return this._input.value;
  }

  getInput$(): Observable<ICalculatorInput> {
    return this._input.asObservable();
  }

  update(input: Partial<ICalculatorInput>): void {
    this._input.next({
      ...this._input.value,
      ...input,
    } as ICalculatorInput);
    this.prefs.set(this.STORAGE_KEY + ':' + this.mode, this._input.value);
  }

  init(mode: CALCULATOR_MODE, input?: Partial<ICalculatorInput>): void {
    this.mode = mode;
    // To be able to reset to default
    this._initInput = {
      ...DEFAULT_INPUT,
      ...input,
    } as ICalculatorInput;

    // Will trigger auto computed inputs
    this.update({
      ...this._initInput,
      ...this.loadFromStorage(),
    });
  }

  resetField(field: keyof ICalculatorInput): void {
    this.update({
      [field]: this._initInput?.[field] ?? DEFAULT_INPUT[field],
    });
  }

  reset(): void {
    this.update(this._initInput ?? DEFAULT_INPUT);
  }

  private loadFromStorage(): ICalculatorInput | null {
    return this.prefs.get<ICalculatorInput>(this.STORAGE_KEY + ':' + this.mode);
  }
}
