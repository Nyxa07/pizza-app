import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { clampWeight } from '../pizza-format.model';
import { EXPERT_DRAFT_STORAGE_KEY } from './calculator-draft-storage.constants';
import { DoughDefaultsService } from './dough-defaults.service';

/** The persisted in-progress calculation owned exclusively by Expert. */
@Injectable({ providedIn: 'root' })
export class ExpertDraftService {
  private readonly prefs = inject(PrefsStorage);
  private readonly defaults = inject(DoughDefaultsService);
  private readonly input = new BehaviorSubject<ICalculatorInput>(
    this.defaults.getDefaults(),
  );

  getInput(): ICalculatorInput {
    return this.input.value;
  }

  getInput$(): Observable<ICalculatorInput> {
    return this.input.asObservable();
  }

  update(partial: Partial<ICalculatorInput>): void {
    this.persist({ ...this.input.value, ...partial });
  }

  init(): void {
    this.persist({
      ...this.defaults.getDefaults(),
      ...(this.load() ?? {}),
    });
  }

  newCalculation(): void {
    this.persist(this.defaults.getDefaults());
  }

  replaceWithCopy(input: ICalculatorInput): void {
    this.persist({ ...input });
  }

  resetField(field: keyof ICalculatorInput): void {
    this.update({
      [field]: this.defaults.getDefaults()[field],
    });
  }

  private load(): ICalculatorInput | null {
    return this.prefs.get<ICalculatorInput>(EXPERT_DRAFT_STORAGE_KEY);
  }

  private persist(input: ICalculatorInput): void {
    const draft = this.withWeightInStyle(input);
    this.input.next(draft);
    this.prefs.set(EXPERT_DRAFT_STORAGE_KEY, draft);
  }

  /**
   * A ball weight is always inside the bounds of its style: the Draft may
   * arrive from an older release, from a Dough saved before the bounds
   * existed, or from a style change. Idempotent, and it only ever rewrites
   * the Draft — saved Doughs and Defaults keep whatever they hold.
   */
  private withWeightInStyle(input: ICalculatorInput): ICalculatorInput {
    if (input.pizzaWeight === null) {
      return input;
    }

    const pizzaWeight = clampWeight(input.pizzaType, input.pizzaWeight);
    return pizzaWeight === input.pizzaWeight
      ? input
      : { ...input, pizzaWeight };
  }
}
