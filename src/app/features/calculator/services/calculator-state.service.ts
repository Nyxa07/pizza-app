import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { CalculatorService } from './calculator.service';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { HydrationService } from './hydration.service';

export interface CalculatorInput {
  nbPizzas: number;
  doughType: DoughType;
  yeastType: YeastType;
  hydrationRatio: number;
  temperature: number;
  poolishRatio?: number;
  rtRestTime: number;
  coldRestTime: number;
  flourStrength: number;
  saltRatio: number;
  honeyRatio: number;
  pizzaWeight: number;
}

export interface InputsAutoCompute {
  nbPizzas: boolean;
  doughType: boolean;
  yeastType: boolean;
  hydrationRatio: boolean;
  temperature: boolean;
  rtRestTime: boolean;
  coldRestTime: boolean;
  poolishRatio: boolean;
  flourStrength: boolean;
  saltRatio: boolean;
  honeyRatio: boolean;
  pizzaWeight: boolean;
}

export const DEFAULT_INPUT: CalculatorInput = {
  nbPizzas: 5,
  doughType: DoughType.DIRECT,
  yeastType: YeastType.DRY_ACTIVE,
  hydrationRatio: 0.62,
  temperature: 20,
  rtRestTime: 16,
  coldRestTime: 0,
  poolishRatio: 0.3,
  flourStrength: 270,
  saltRatio: 0.028,
  honeyRatio: 0.004,
  pizzaWeight: 250,
};

export const AUTO_COMPUTE_COMPLEX_INPUTS: InputsAutoCompute = {
  nbPizzas: false,
  doughType: false,
  yeastType: false,
  hydrationRatio: false,
  temperature: false,
  rtRestTime: false,
  coldRestTime: false,
  poolishRatio: true,
  flourStrength: true,
  saltRatio: true,
  honeyRatio: true,
  pizzaWeight: false,
};

export const AUTO_COMPUTE_SIMPLE_INPUTS: InputsAutoCompute = {
  nbPizzas: false,
  rtRestTime: false,
  saltRatio: true,
  honeyRatio: true,
  poolishRatio: true,
  doughType: true,
  yeastType: false,
  hydrationRatio: true,
  temperature: false,
  coldRestTime: true,
  flourStrength: true,
  pizzaWeight: true,
};

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private readonly STORAGE_KEY = 'calculator';
  private readonly STORAGE_KEY_AUTO_COMPUTE = this.STORAGE_KEY + ':autoCompute';
  private readonly _input = new BehaviorSubject<CalculatorInput>(
    this.loadFromStorage() ?? DEFAULT_INPUT,
  );
  private readonly _autoCompute = new BehaviorSubject<InputsAutoCompute>(
    this.loadAutoComputeFromStorage() ?? AUTO_COMPUTE_COMPLEX_INPUTS,
  );

  readonly input$ = this._input.asObservable();
  readonly result$ = this.input$.pipe(
    map((i) => this.calculator.compute(i)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
  readonly autoCompute$ = this._autoCompute.asObservable();

  constructor(
    private calculator: CalculatorService,
    private prefs: PrefsStorage,
    private hydrationService: HydrationService,
  ) {}

  setSimpleMode(): void {
    this.updateAutoCompute(AUTO_COMPUTE_SIMPLE_INPUTS);
    this.reset();
  }

  setComplexMode(): void {
    this.updateAutoCompute(AUTO_COMPUTE_COMPLEX_INPUTS);
    this.reset();
  }

  getAutoCompute(key: keyof InputsAutoCompute): boolean {
    return this._autoCompute.value[key] ?? false;
  }

  update(input: CalculatorInput): void {
    this._input.next(input);
    this.prefs.set(this.STORAGE_KEY, input);

    // Update visibility of poolish ratio at the end because it triggers reset to default
    this.afterUpdateInput(input);
  }

  private afterUpdateInput(input: CalculatorInput): void {
    if (input.doughType === DoughType.DIRECT) {
      this.updateAutoCompute({ poolishRatio: true });
    } else {
      this.updateAutoCompute({ poolishRatio: false });
    }
  }

  updateAutoCompute(autoCompute: Partial<InputsAutoCompute>): void {
    const currentAutoCompute = this._autoCompute.value;
    const newAutoCompute: InputsAutoCompute = {
      ...currentAutoCompute,
      ...autoCompute,
    };

    this._autoCompute.next(newAutoCompute);
    this.prefs.set(this.STORAGE_KEY_AUTO_COMPUTE, newAutoCompute);
    this.computeAutoComputedInputs();
  }

  private computeAutoComputedInputs(): void {
    const input = this._input.value;
    const autoCompute = this._autoCompute.value;

    if (autoCompute.flourStrength) {
      input.flourStrength = DEFAULT_INPUT.flourStrength;
    }

    if (autoCompute.honeyRatio) {
      input.honeyRatio = DEFAULT_INPUT.honeyRatio;
    }

    if (autoCompute.saltRatio) {
      input.saltRatio = DEFAULT_INPUT.saltRatio;
    }

    if (autoCompute.pizzaWeight) {
      input.pizzaWeight = DEFAULT_INPUT.pizzaWeight;
    }

    if (autoCompute.hydrationRatio) {
      input.hydrationRatio =
        Math.round(
          this.hydrationService.compute(input.flourStrength).minHydration * 100,
        ) / 100;
    }

    this._input.next(input);
    this.prefs.set(this.STORAGE_KEY, input);
  }

  reset(): void {
    this.update(DEFAULT_INPUT);
  }

  private loadFromStorage(): CalculatorInput | null {
    return this.prefs.get<CalculatorInput>(this.STORAGE_KEY);
  }

  private loadAutoComputeFromStorage(): InputsAutoCompute | null {
    return this.prefs.get<InputsAutoCompute>(this.STORAGE_KEY_AUTO_COMPUTE);
  }
}
