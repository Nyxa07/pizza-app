import { Injectable, inject } from '@angular/core';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { ICalculatorSettings } from '../interfaces/calculator-settings.interface';
import { ExpertDraftService } from './expert-draft.service';
import { GuidedDraftService } from './guided-draft.service';

/** Stable engine settings used by Expert and saved Dough documents. */
export const EXPERT_CALCULATOR_SETTINGS: ICalculatorSettings = {
  pizzaWeight: { auto: false },
  saltRatio: { auto: false },
  honeyRatio: { auto: false },
  flourStrength: { auto: false },
  hydrationRatio: { auto: false },
  doughType: { auto: false },
  poolishRatio: { auto: false },
  yeastType: { auto: false },
  temperature: { auto: false },
  globalRestTime: { auto: false },
  rtRestTime: { auto: false },
  coldRestTime: { auto: false },
  oliveOilRatio: { auto: false },
};

/** Stable engine settings used by the Guided path and its Method. */
export const GUIDED_CALCULATOR_SETTINGS: ICalculatorSettings = {
  pizzaWeight: { auto: true },
  saltRatio: { auto: true },
  honeyRatio: { auto: true },
  flourStrength: { auto: false },
  hydrationRatio: { auto: true },
  doughType: { auto: false },
  poolishRatio: { auto: true },
  yeastType: { auto: false },
  temperature: { auto: false },
  globalRestTime: { auto: false },
  rtRestTime: { auto: false },
  coldRestTime: { auto: false },
  oliveOilRatio: { auto: true },
};

@Injectable({
  providedIn: 'root',
})
export class CalculatorInitializerService {
  private readonly expertDraft = inject(ExpertDraftService);
  private readonly guidedDraft = inject(GuidedDraftService);

  initExpert(): void {
    this.expertDraft.init();
  }

  initGuided(): void {
    this.guidedDraft.init();
  }

  initMethod(path: CalculatorPath): void {
    if (path === CalculatorPath.GUIDED) {
      this.initGuided();
      return;
    }

    this.initExpert();
  }
}
