import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import {
  clampSize,
  fallbackWeight,
  sizeForWeight,
} from '../pizza-format.model';
import { INTERMEDIATE_DRAFT_STORAGE_KEY } from './calculator-draft-storage.constants';
import { DoughDefaultsService } from './dough-defaults.service';

/**
 * The persisted answers owned exclusively by the Intermediate path, streamed
 * like the two others so a reset reaches a screen still cached in the Ionic
 * router-outlet.
 */
@Injectable({ providedIn: 'root' })
export class IntermediateDraftService {
  private readonly prefs = inject(PrefsStorage);
  private readonly defaults = inject(DoughDefaultsService);
  private readonly draft = new BehaviorSubject<IIntermediateCalculatorDraft>(
    this.createSeed(),
  );

  getDraft(): IIntermediateCalculatorDraft {
    return this.draft.value;
  }

  getDraft$(): Observable<IIntermediateCalculatorDraft> {
    return this.draft.asObservable();
  }

  update(partial: Partial<IIntermediateCalculatorDraft>): void {
    this.persist({ ...this.draft.value, ...partial });
  }

  init(): void {
    this.persist({
      ...this.createSeed(),
      ...(this.load() ?? {}),
    });
  }

  newCalculation(): void {
    this.persist(this.createSeed());
  }

  /**
   * A new calculation starts from « Mes pâtes par défaut ». The Defaults speak
   * in grams, this path in centimetres, so the seed size is read back from the
   * default ball weight — 28 cm Neapolitan, 31 cm Roman out of the factory.
   */
  private createSeed(): IIntermediateCalculatorDraft {
    const defaults = this.defaults.getDefaults();
    const splitRestTime =
      (defaults.rtRestTime ?? 0) + (defaults.coldRestTime ?? 0);

    return {
      pizzaType: defaults.pizzaType,
      nbPizzas: defaults.nbPizzas,
      sizeCm: sizeForWeight(
        defaults.pizzaType,
        // A Default carrying no weight falls back on the style's own.
        defaults.pizzaWeight ?? fallbackWeight(defaults.pizzaType),
      ),
      doughType: defaults.doughType,
      globalRestTime: defaults.globalRestTime ?? splitRestTime,
      temperature: defaults.temperature,
      yeastType: defaults.yeastType,
    };
  }

  private load(): IIntermediateCalculatorDraft | null {
    return this.prefs.get<IIntermediateCalculatorDraft>(
      INTERMEDIATE_DRAFT_STORAGE_KEY,
    );
  }

  /**
   * The size always sits inside the range of its style: switching to a style
   * that stops earlier brings a 35 cm Neapolitan back to a 33 cm Roman, and
   * that clamped value becomes the user's new answer.
   */
  private persist(draft: IIntermediateCalculatorDraft): void {
    const inRange: IIntermediateCalculatorDraft = {
      ...draft,
      sizeCm: clampSize(draft.pizzaType, draft.sizeCm),
    };
    this.draft.next(inRange);
    this.prefs.set(INTERMEDIATE_DRAFT_STORAGE_KEY, inRange);
  }
}
