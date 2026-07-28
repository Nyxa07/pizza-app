import { Injectable, inject } from '@angular/core';

import { roundIngredientGrams } from 'src/app/features/method/ingredient-grams';

import { DoughType } from '../enums/dough-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import type { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { CalculatorService } from '../services/calculator.service';
import type { IDoughFacts } from './dough-facts.interface';

/**
 * The single module going from a calculator input to the figures every surface
 * shows of a dough: `factsOf(input)`.
 *
 * It runs the engine and decides the precision each figure carries — nothing
 * outside it rounds a dough figure, and nothing outside it knows that a
 * poolish dough ferments in its preferment while a direct one ferments in the
 * dough itself. The pipes are left with the language: decimal separator, hour
 * format.
 *
 * The two live bars of the calculator, the library card, the document of a
 * Dough and the dough a Recipe suggests all read the same interface, so they
 * cannot announce two different figures for the same dough.
 *
 * It holds no state. A saved Dough carries no `path` field and needs none:
 * whatever path saved it, its input is complete, and the engine recomputes it
 * from those values alone — never re-read from the current Defaults, which is
 * exactly the document semantics of ADR-0002.
 */
@Injectable({ providedIn: 'root' })
export class DoughFacts {
  private readonly engine = inject(CalculatorService);

  /** The displayable facts of any calculator input, saved as a document or not. */
  factsOf(input: ICalculatorInput): IDoughFacts {
    const output = this.engine.process(input);
    const { total } = output;
    const rest = this.restPart(input, output);
    const ambientHours = Math.round(rest.rtRestTime);
    const coldHours = Math.round(rest.coldRestTime);

    return {
      balls: input.nbPizzas,
      ballWeight: Math.round(output.pizzaBalls.weight),
      hydrationPct: Math.round(output.hydrationRatio * 100),
      hydrationRatio: output.hydrationRatio,
      doughType: input.doughType,
      ambientHours,
      coldHours,
      // Summed after rounding: the split and the total are shown on two
      // different screens and must not differ by an hour.
      restHours: ambientHours + coldHours,
      totalWeight: Math.round(
        total.flour +
          total.water +
          total.salt +
          total.yeast +
          total.honey +
          total.oliveOil,
      ),
      split: {
        flour: roundIngredientGrams('flour', total.flour),
        water: roundIngredientGrams('water', total.water),
        salt: roundIngredientGrams('salt', total.salt),
        // The live bar weighs its yeast exactly like the Méthode does.
        yeast: roundIngredientGrams('yeast', total.yeast),
      },
    };
  }

  /** The bulk rest happens in the poolish for a poolish dough, else in the dough. */
  private restPart(input: ICalculatorInput, output: ICalculatorOutput) {
    return input.doughType === DoughType.POOLISH
      ? output.poolish
      : output.dough;
  }
}
