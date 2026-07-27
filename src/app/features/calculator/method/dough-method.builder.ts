import type {
  IMethodDef,
  IMethodDefStep,
  MethodIngredientKey,
  MethodQuantities,
} from 'src/app/features/method/interfaces/method-def.interface';
import type {
  IMethod,
  IMethodIngredient,
  IMethodStep,
} from 'src/app/features/method/interfaces/method.interface';

import { DoughType } from '../enums/dough-type.enum';
import type { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { DirectDoughMethod } from '../methods/direct-dough.method';
import { PoolishDoughMethod } from '../methods/poolish-dough.method';
import { PoolishMethod } from '../methods/poolish.method';
import { after } from './method-clock';

export const METHOD_INGREDIENT_KEYS: MethodIngredientKey[] = [
  'flour',
  'water',
  'yeast',
  'salt',
  'honey',
  'oliveOil',
];

/**
 * The parts a dough of this type is made of — one for a direct dough, the
 * poolish and then the dough for a poolish one. The only place that turns a
 * dough type into method definitions.
 */
export function methodDefsFor(
  doughType: DoughType,
  output: ICalculatorOutput,
): IMethodDef[] {
  return doughType === DoughType.POOLISH
    ? [new PoolishMethod(output), new PoolishDoughMethod(output)]
    : [new DirectDoughMethod(output)];
}

/** Every step the reader will actually see, definitions included. */
export function visibleSteps(defs: IMethodDef[]): IMethodDefStep[] {
  return defs.flatMap((def) => def.steps.filter((step) => !step.hide));
}

/**
 * Display quantities for one weigh-in or narrated milestone, zero grams
 * skipped. Yeast keeps one decimal and never rounds down to nothing — a
 * poolish without its pinch of yeast would narrate a lie.
 */
export function toMethodIngredients(
  quantities: MethodQuantities,
  keys: MethodIngredientKey[] = METHOD_INGREDIENT_KEYS,
): IMethodIngredient[] {
  return keys
    .map((key) => {
      const grams = quantities[key] ?? 0;
      return {
        key,
        grams:
          key === 'yeast'
            ? Math.max(0.1, Math.round(grams * 10) / 10)
            : Math.round(grams),
      };
    })
    .filter(({ key, grams }) => (quantities[key] ?? 0) > 0 && grams > 0);
}

/**
 * Builds the full Dough method on the clock: the weigh-in per part and every
 * visible step, the milestones dated with the engine's timings (quarter-hour
 * grid, same clock as the aperçu), down to the bake.
 */
export function buildDoughMethod(
  doughType: DoughType,
  output: ICalculatorOutput,
  startAt: Date,
): IMethod {
  const defs = methodDefsFor(doughType, output);

  return {
    sections: defs.map((def) => ({
      title: def.title,
      ingredients: toMethodIngredients(def.quantities),
    })),
    steps: defs.flatMap((def) =>
      def.steps
        .filter((step) => !step.hide)
        .map((step) => toStep(def, step, startAt)),
    ),
    startAt,
    readyAt: after(startAt, output.total.prepTime),
  };
}

function toStep(
  def: IMethodDef,
  step: IMethodDefStep,
  startAt: Date,
): IMethodStep {
  return {
    icon: step.icon,
    at: step.atHours !== undefined ? after(startAt, step.atHours) : null,
    title: `${step.baseTranslationKey}.title`,
    variables: { ...def.variables, ...(step.variables ?? {}) },
    helper:
      step.helperDescriptions > 0
        ? {
            title: `${step.baseTranslationKey}.helper.title`,
            descriptions: Array.from(
              { length: step.helperDescriptions },
              (_, i) => `${step.baseTranslationKey}.helper.descriptions.${i}`,
            ),
          }
        : null,
    ingredients: step.ingredients ? toMethodIngredients(step.ingredients) : [],
  };
}
