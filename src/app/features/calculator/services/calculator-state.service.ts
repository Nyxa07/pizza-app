import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CALCULATOR_MODE } from '../enums/calculator-mode.enum';
import { DEFAULT_INPUT } from './calculator-initializer.service';

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
      [field]: this._initInput?.[field],
    });
  }

  reset(): void {
    this.update(this._initInput ?? {});
  }

  private loadFromStorage(): ICalculatorInput | null {
    return this.prefs.get<ICalculatorInput>(this.STORAGE_KEY + ':' + this.mode);
  }
}
