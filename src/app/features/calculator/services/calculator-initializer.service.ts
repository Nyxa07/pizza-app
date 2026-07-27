import { Injectable, inject } from '@angular/core';

import { map, Observable } from 'rxjs';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ExpertDraftService } from './expert-draft.service';
import { GuidedDraftService } from './guided-draft.service';
import { GuidedInputAdapter } from './guided-input.adapter';
import { IntermediateDraftService } from './intermediate-draft.service';
import { IntermediateInputAdapter } from './intermediate-input.adapter';

/** What every calculator path exposes to the screens that host it. */
interface CalculatorPathRegistration {
  init(): void;
  newCalculation(): void;
  resolvedInput$(): Observable<ICalculatorInput>;
}

/**
 * The registry of calculator paths: one place that knows, for a given path,
 * how to resume it, how to start it over and where its resolved engine input
 * comes from.
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
    },
    [CalculatorPath.GUIDED]: {
      init: () => this.guidedDraft.init(),
      newCalculation: () => this.guidedDraft.newCalculation(),
      resolvedInput$: () =>
        this.guidedDraft
          .getDraft$()
          .pipe(map((draft) => this.guidedInputAdapter.resolve(draft))),
    },
    [CalculatorPath.INTERMEDIATE]: {
      init: () => this.intermediateDraft.init(),
      newCalculation: () => this.intermediateDraft.newCalculation(),
      resolvedInput$: () =>
        this.intermediateDraft
          .getDraft$()
          .pipe(map((draft) => this.intermediateInputAdapter.resolve(draft))),
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
}
