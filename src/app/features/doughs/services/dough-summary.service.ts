import { Injectable, inject } from '@angular/core';

import { DoughType } from 'src/app/features/calculator/enums/dough-type.enum';
import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import type { ICalculatorOutput } from 'src/app/features/calculator/interfaces/calculator-output.interface';
import { EXPERT_CALCULATOR_SETTINGS } from 'src/app/features/calculator/services/calculator-initializer.service';
import { CalculatorService } from 'src/app/features/calculator/services/calculator.service';

import type { DoughSummary } from '../interfaces/dough-summary.interface';
import type { Dough } from '../interfaces/dough.interface';

/**
 * The single seam translating a calculator input into displayable Dough facts
 * (issue #94). Every surface showing those facts — library card, document
 * header, Recipe suggestion — reads a summary, so a field left on « auto »
 * can never leave a hole in one place and a value in another.
 *
 * It resolves nothing on its own: the engine (`CalculatorService`) owns the
 * formulas, this is a thin presentation layer above its output.
 *
 * A saved Dough is always computed with `EXPERT_CALCULATOR_SETTINGS`, whatever
 * the path it was saved from, and the model carries no `path` field:
 * – `GuidedInputAdapter` already materialises salt / honey / poolish / flour
 *   strength from the Defaults, so a saved input carries them hard-coded;
 * – the remaining fields (hydration, ball weight, olive oil, rest split) are
 *   `null` under both settings profiles, which therefore agree;
 * – the only divergence is that the Expert profile freezes salt / honey /
 *   poolish to the recorded values instead of re-reading the current Defaults,
 *   which is exactly the document semantics of ADR-0002.
 */
@Injectable({ providedIn: 'root' })
export class DoughSummaryService {
  private readonly calculator = inject(CalculatorService);
  private readonly cache = new Map<string, DoughSummary>();

  /** The resolved facts of any calculator input, saved as a document or not. */
  summarize(input: ICalculatorInput): DoughSummary {
    const output = this.calculator.process(EXPERT_CALCULATOR_SETTINGS, input);
    const rest = this.restPart(input, output);

    return {
      balls: input.nbPizzas,
      ballWeight: output.pizzaBalls.weight,
      hydrationRatio: output.hydrationRatio,
      doughType: input.doughType,
      ambientHours: rest.rtRestTime,
      coldHours: rest.coldRestTime,
      restHours: rest.rtRestTime + rest.coldRestTime,
    };
  }

  /**
   * The facts of a saved Dough, memoised per document revision so that
   * scrolling the library — or a re-emission of the Doughs stream — does not
   * run the engine again.
   */
  forDough(dough: Dough): DoughSummary {
    const key = `${dough.id}@${dough.updatedAt ?? ''}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    // Keep at most one entry per document: an edit supersedes its own revision.
    for (const staleKey of this.cache.keys()) {
      if (staleKey.startsWith(`${dough.id}@`)) {
        this.cache.delete(staleKey);
      }
    }

    const summary = this.summarize(dough.input);
    this.cache.set(key, summary);
    return summary;
  }

  /** The bulk rest happens in the poolish for a poolish dough, else in the dough. */
  private restPart(input: ICalculatorInput, output: ICalculatorOutput) {
    return input.doughType === DoughType.POOLISH
      ? output.poolish
      : output.dough;
  }
}
