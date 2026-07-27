import { roundIngredientGrams } from 'src/app/features/method/ingredient-grams';

import { ICalculatorOutput } from '../interfaces/calculator-output.interface';

/**
 * What every calculator screen reads off one engine run: the quantities of
 * the live bar plus the values the tiles and read-only rows display. Derived
 * in one place so two paths can never round or split the same dough
 * differently.
 */
export interface ICalculatorResult {
  /** Total dough weight in grams, every ingredient included. */
  total: number;
  split: { flour: number; water: number; salt: number; yeast: number };
  /** The effective ball weight, in grams. */
  weight: number;
  hydrationPct: number;
  ambientHours: number;
  coldHours: number;
}

/**
 * The engine output as the screens display it. `isPoolish` decides which part
 * of the output carries the rest: a poolish dough ferments in its preferment,
 * a direct one in the dough itself.
 */
export function summarizeOutput(
  output: ICalculatorOutput,
  isPoolish: boolean,
): ICalculatorResult {
  const restPart = isPoolish ? output.poolish : output.dough;
  const total = output.total;

  return {
    total: Math.round(
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
    weight: Math.round(output.pizzaBalls.weight),
    hydrationPct: Math.round(output.hydrationRatio * 100),
    ambientHours: Math.round(restPart.rtRestTime),
    coldHours: Math.round(restPart.coldRestTime),
  };
}
