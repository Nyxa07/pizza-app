import { Injectable, inject } from '@angular/core';

import { map, Observable } from 'rxjs';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ICalculatorSettings } from '../interfaces/calculator-settings.interface';
import { ExpertDraftService } from './expert-draft.service';
import { GuidedDraftService } from './guided-draft.service';
import { GuidedInputAdapter } from './guided-input.adapter';
import { IntermediateDraftService } from './intermediate-draft.service';
import { IntermediateInputAdapter } from './intermediate-input.adapter';

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

/**
 * Stable engine settings used by the Intermediate path and its Method. Every
 * field is explicit: its adapter already produces a complete input, and the
 * `null`s it writes are requests to derive addressed to the processors, not
 * holes for the Defaults to fill.
 */
export const INTERMEDIATE_CALCULATOR_SETTINGS: ICalculatorSettings = {
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

/** What every calculator path exposes to the screens that host it. */
interface CalculatorPathRegistration {
  init(): void;
  newCalculation(): void;
  resolvedInput$(): Observable<ICalculatorInput>;
  readonly settings: ICalculatorSettings;
}

/**
 * The registry of calculator paths: one place that knows, for a given path,
 * how to resume it, how to start it over, where its resolved engine input
 * comes from and which engine settings it runs under.
 *
 * Without it, the header reset button, the Method screen and this service
 * would each branch over every path — three places to touch per new path.
 */
@Injectable({
  providedIn: 'root',
})
export class CalculatorInitializerService {
  private readonly expertDraft = inject(ExpertDraftService);
  private readonly guidedDraft = inject(GuidedDraftService);
  private readonly guidedInputAdapter = inject(GuidedInputAdapter);
  private readonly intermediateDraft = inject(IntermediateDraftService);
  private readonly intermediateInputAdapter = inject(IntermediateInputAdapter);

  private readonly registry: Record<
    CalculatorPath,
    CalculatorPathRegistration
  > = {
    [CalculatorPath.EXPERT]: {
      init: () => this.expertDraft.init(),
      newCalculation: () => this.expertDraft.newCalculation(),
      resolvedInput$: () => this.expertDraft.getInput$(),
      settings: EXPERT_CALCULATOR_SETTINGS,
    },
    [CalculatorPath.GUIDED]: {
      init: () => this.guidedDraft.init(),
      newCalculation: () => this.guidedDraft.newCalculation(),
      resolvedInput$: () =>
        this.guidedDraft
          .getDraft$()
          .pipe(map((draft) => this.guidedInputAdapter.resolve(draft))),
      settings: GUIDED_CALCULATOR_SETTINGS,
    },
    [CalculatorPath.INTERMEDIATE]: {
      init: () => this.intermediateDraft.init(),
      newCalculation: () => this.intermediateDraft.newCalculation(),
      resolvedInput$: () =>
        this.intermediateDraft
          .getDraft$()
          .pipe(map((draft) => this.intermediateInputAdapter.resolve(draft))),
      settings: INTERMEDIATE_CALCULATOR_SETTINGS,
    },
  };

  /** Resumes the Draft of one path, and only that one. */
  init(path: CalculatorPath): void {
    this.registry[path].init();
  }

  /** Starts the Draft of one path over, leaving the other calculations be. */
  newCalculation(path: CalculatorPath): void {
    this.registry[path].newCalculation();
  }

  /** The complete engine input of a path, resolved through its own seam. */
  resolvedInput$(path: CalculatorPath): Observable<ICalculatorInput> {
    return this.registry[path].resolvedInput$();
  }

  /** The engine settings a path and its Method run under. */
  settingsFor(path: CalculatorPath): ICalculatorSettings {
    return this.registry[path].settings;
  }

  initExpert(): void {
    this.init(CalculatorPath.EXPERT);
  }

  initGuided(): void {
    this.init(CalculatorPath.GUIDED);
  }

  initIntermediate(): void {
    this.init(CalculatorPath.INTERMEDIATE);
  }
}
