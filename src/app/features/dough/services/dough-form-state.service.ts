import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay } from 'rxjs';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { DoughCalculatorService } from './dough-calculator.service';
import { DoughType } from '../enums/dough-type.enum';
import { YeastType } from '../enums/yeast-type.enum';

export interface DoughInput {
  nbPizzas: number;
  doughType: DoughType;
  yeastType: YeastType;
  hydrationRatio: number;
  temperature: number;
  poolishRatio?: number;
  rtRestTime: number;
  coldRestTime: number;
}

export const DEFAULT_INPUT: DoughInput = {
  nbPizzas: 5,
  doughType: DoughType.DIRECT,
  yeastType: YeastType.DRY_ACTIVE,
  hydrationRatio: 0.62,
  temperature: 20,
  rtRestTime: 16,
  coldRestTime: 0,
  poolishRatio: 0.3,
};

@Injectable({ providedIn: 'root' })
export class DoughFormStateService {
  private readonly STORAGE_KEY = 'dough:form';
  private readonly _input = new BehaviorSubject<DoughInput>(
    this.loadFromStorage() ?? DEFAULT_INPUT,
  );

  readonly input$ = this._input.asObservable();
  readonly result$ = this.input$.pipe(
    map((i) => this.calculator.compute(i)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(
    private calculator: DoughCalculatorService,
    private prefs: PrefsStorage,
  ) {}

  update(input: DoughInput): void {
    this._input.next(input);
    this.prefs.set(this.STORAGE_KEY, input);
  }

  reset(): void {
    this._input.next(DEFAULT_INPUT);
    this.prefs.remove(this.STORAGE_KEY);
  }

  private loadFromStorage(): DoughInput | null {
    return this.prefs.get<DoughInput>(this.STORAGE_KEY);
  }
}
