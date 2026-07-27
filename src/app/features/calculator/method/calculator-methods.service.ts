import { Injectable, inject } from '@angular/core';

import type { IMethod } from 'src/app/features/method/interfaces/method.interface';
import type { IMethodPreview } from 'src/app/features/method/interfaces/method-preview.interface';

import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CalculatorService } from '../services/calculator.service';
import { buildDoughMethod } from './dough-method.builder';
import { ceilToQuarterHour, MethodClock } from './method-clock';
import { buildMethodPreview } from './method-preview.builder';

/**
 * The single module going from a calculator input to a Dough method.
 *
 * It runs the engine, assembles the steps and dates them — nothing outside
 * names a step, an engine output or a clock. A screen that wants the aperçu
 * or the full method hands over an input and gets back what it renders.
 *
 * The aperçu and the full Method screen are two readings of the same run at
 * two levels of detail, which is why they live behind one interface: they
 * cannot disagree on the times, the grams or the number of steps.
 */
@Injectable({ providedIn: 'root' })
export class CalculatorMethods {
  private readonly engine = inject(CalculatorService);
  private readonly clock = inject(MethodClock);

  /**
   * The full Dough method for an input, or `null` when there is nothing to
   * narrate — the Method screen is reachable with a Draft the user never
   * filled in, and an empty method is the one thing it must not render.
   */
  methodFor(input: ICalculatorInput): IMethod | null {
    const output = this.engine.process(input);

    return output.total.flour > 0
      ? buildDoughMethod(input.doughType, output, this.startAt())
      : null;
  }

  /**
   * The aperçu of that same method. Total, unlike {@link methodFor}: it is
   * rendered inside the form that owns the Draft, which always holds one.
   */
  previewFor(input: ICalculatorInput): IMethodPreview {
    return buildMethodPreview(
      input,
      this.engine.process(input),
      this.startAt(),
    );
  }

  private startAt(): Date {
    return ceilToQuarterHour(this.clock.now());
  }
}
