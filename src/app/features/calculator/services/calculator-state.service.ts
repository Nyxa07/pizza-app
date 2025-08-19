import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { CalculatorService } from './calculator.service';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';

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

export interface InputsVisibility {
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

export const DEFAULT_VISIBILITY: InputsVisibility = {
  nbPizzas: true,
  doughType: true,
  yeastType: true,
  hydrationRatio: true,
  temperature: true,
  rtRestTime: true,
  coldRestTime: true,
  poolishRatio: false,
  flourStrength: false,
  saltRatio: false,
  honeyRatio: false,
  pizzaWeight: false,
};

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private readonly STORAGE_KEY = 'calculator';
  private readonly STORAGE_KEY_VISIBILITY = this.STORAGE_KEY + ':visibility';
  private readonly _input = new BehaviorSubject<CalculatorInput>(
    this.loadFromStorage() ?? DEFAULT_INPUT,
  );
  private readonly _visibility = new BehaviorSubject<InputsVisibility>(
    this.loadVisibilityFromStorage() ?? DEFAULT_VISIBILITY,
  );

  readonly input$ = this._input.asObservable();
  readonly result$ = this.input$.pipe(
    map((i) => this.calculator.compute(i)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
  readonly visibility$ = this._visibility.asObservable();

  constructor(
    private calculator: CalculatorService,
    private prefs: PrefsStorage,
  ) {}

  getVisibility(key: keyof InputsVisibility): boolean {
    return this._visibility.value[key] ?? false;
  }

  update(input: CalculatorInput): void {
    this._input.next(input);
    this.prefs.set(this.STORAGE_KEY, input);

    // Update visibility of poolish ratio at the end because it triggers reset to default
    if (input.doughType === DoughType.DIRECT) {
      this.updateVisibility({ poolishRatio: false });
    } else {
      this.updateVisibility({ poolishRatio: true });
    }
  }

  updateVisibility(visibility: Partial<InputsVisibility>): void {
    const currentVisibility = this._visibility.value;
    const newVisibility: InputsVisibility = {
      ...currentVisibility,
      ...visibility,
    };

    // When the visibility of a field changes, ensure its value is reset to the default
    const currentInput = this._input.value;
    let patchedInput: CalculatorInput = { ...currentInput };

    (Object.keys(visibility) as (keyof InputsVisibility)[])
      .filter((key) => !visibility[key]) // Only reset fields that are made hidden
      .forEach((key) => {
        // Keys of InputsVisibility and DoughInput are aligned by design
        const inputKey = key as keyof CalculatorInput;
        if (inputKey in DEFAULT_INPUT) {
          patchedInput = {
            ...patchedInput,
            [inputKey]: DEFAULT_INPUT[inputKey],
          } as CalculatorInput;
        }
      });

    // Persist updated input and visibility states
    this._input.next(patchedInput);
    this.prefs.set(this.STORAGE_KEY, patchedInput);

    this._visibility.next(newVisibility);
    this.prefs.set(this.STORAGE_KEY_VISIBILITY, newVisibility);
  }

  reset(): void {
    this.update(DEFAULT_INPUT);
  }

  private loadFromStorage(): CalculatorInput | null {
    return this.prefs.get<CalculatorInput>(this.STORAGE_KEY);
  }

  private loadVisibilityFromStorage(): InputsVisibility | null {
    return this.prefs.get<InputsVisibility>(this.STORAGE_KEY_VISIBILITY);
  }
}
