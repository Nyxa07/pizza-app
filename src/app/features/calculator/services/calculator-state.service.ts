import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { CalculatorService } from './calculator.service';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';
import { HydrationService } from './hydration.service';
import { RestTimeService } from './rest-time.service';

export interface CalculatorInput {
  nbPizzas: number;
  doughType: DoughType;
  yeastType: YeastType;
  hydrationRatio: number;
  temperature: number;
  poolishRatio?: number;
  rtRestTime: number | null;
  coldRestTime: number | null;
  flourStrength: number;
  saltRatio: number;
  honeyRatio: number;
  pizzaWeight: number;
  preparationDate: number | null;
  cookingDate: number | null;
  pizzaBallsRestTime: number | null;
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
  preparationDate: boolean;
  cookingDate: boolean;
  pizzaBallsRestTime: boolean;
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
  preparationDate: null,
  cookingDate: null,
  pizzaBallsRestTime: null,
};

export const AUTO_COMPUTE_INPUTS: InputsAutoCompute = {
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
  preparationDate: true,
  cookingDate: true,
  pizzaBallsRestTime: true,
};

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private INIT_KEY: string = 'default';
  private readonly STORAGE_KEY = 'calculator';
  private readonly STORAGE_KEY_AUTO_COMPUTE = this.STORAGE_KEY + ':autoCompute';
  private readonly _input = new BehaviorSubject<CalculatorInput>(DEFAULT_INPUT);
  private readonly _autoCompute = new BehaviorSubject<InputsAutoCompute>(
    AUTO_COMPUTE_INPUTS,
  );

  readonly input$ = this._input.asObservable();
  readonly result$ = this.input$.pipe(
    map((i) => this.calculator.compute(i)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
  readonly autoCompute$ = this._autoCompute.asObservable();

  private _initInput: CalculatorInput | null = null;

  constructor(
    private calculator: CalculatorService,
    private prefs: PrefsStorage,
    private hydrationService: HydrationService,
    private restTimeService: RestTimeService,
  ) {}

  getAutoCompute(key: keyof InputsAutoCompute): boolean {
    return this._autoCompute.value[key] ?? false;
  }

  update(input: Partial<CalculatorInput>): void {
    this._input.next({ ...this._input.value, ...input } as CalculatorInput);
    this.prefs.set(this.INIT_KEY + ':' + this.STORAGE_KEY, this._input.value);

    // Update visibility of poolish ratio at the end because it triggers reset to default
    this.afterUpdateInput();
  }

  private afterUpdateInput(): void {
    const inputValue = this._input.value;

    if (inputValue.doughType === DoughType.DIRECT) {
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
    this.prefs.set(
      this.INIT_KEY + ':' + this.STORAGE_KEY_AUTO_COMPUTE,
      newAutoCompute,
    );
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

    if (autoCompute.pizzaBallsRestTime) {
      input.pizzaBallsRestTime = this.restTimeService.computePizzaBallsRestTime(
        input.temperature,
      );
    }

    if (autoCompute.rtRestTime && autoCompute.coldRestTime) {
      const restTimes = this.restTimeService.compute(input);

      input.rtRestTime = restTimes.rtRestTime;
      input.coldRestTime = restTimes.coldRestTime;
    }

    if (autoCompute.preparationDate && autoCompute.cookingDate) {
      input.preparationDate = null;
      input.cookingDate = null;
    }

    this._input.next(input);
    this.prefs.set(this.INIT_KEY + ':' + this.STORAGE_KEY, input);
  }

  init(
    key: string,
    input?: Partial<CalculatorInput>,
    autoCompute?: Partial<InputsAutoCompute>,
  ): void {
    this.INIT_KEY = key;

    // To be able to reset to default
    this._initInput = {
      ...DEFAULT_INPUT,
      ...input,
    } as CalculatorInput;

    // With stored values if any
    this.update({
      ...this._initInput,
      ...this.loadFromStorage(),
    });

    // this._input.next({
    //   ...this._initInput,
    //   ...this.loadFromStorage(),
    // });

    this.updateAutoCompute({
      ...AUTO_COMPUTE_INPUTS,
      ...autoCompute,
      ...this.loadAutoComputeFromStorage(),
    });

    // this._autoCompute.next({
    //   ...AUTO_COMPUTE_INPUTS,
    //   ...autoCompute,
    //   ...this.loadAutoComputeFromStorage(),
    // });

    // this.computeAutoComputedInputs();
  }

  reset(): void {
    this.update(this._initInput ?? DEFAULT_INPUT);
  }

  private loadFromStorage(): CalculatorInput | null {
    return this.prefs.get<CalculatorInput>(
      this.INIT_KEY + ':' + this.STORAGE_KEY,
    );
  }

  private loadAutoComputeFromStorage(): InputsAutoCompute | null {
    return this.prefs.get<InputsAutoCompute>(
      this.INIT_KEY + ':' + this.STORAGE_KEY_AUTO_COMPUTE,
    );
  }
}
