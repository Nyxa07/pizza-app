import type {
  MethodIngredientKey,
  MethodQuantities,
} from 'src/app/features/method/interfaces/method-def.interface';
import type {
  IMethodPreview,
  IMethodPreviewIngredient,
  IMethodPreviewStep,
} from 'src/app/features/method/interfaces/method-preview.interface';

import { DoughType } from '../enums/dough-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import type { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { after } from './method-clock';
import {
  METHOD_INGREDIENT_KEYS,
  methodDefsFor,
  toMethodIngredients,
  visibleSteps,
} from './dough-method.builder';

const STEPS_KEY = 'calculator.shared.method.steps.';

/**
 * Projects the engine's relative timings onto the clock: the two first dated
 * interventions of the Dough method, the moment the dough is ready, and how
 * many steps the full method holds.
 */
export function buildMethodPreview(
  input: ICalculatorInput,
  output: ICalculatorOutput,
  start: Date,
): IMethodPreview {
  const hasPoolish = input.doughType === DoughType.POOLISH;

  return {
    steps: hasPoolish
      ? poolishSteps(output, start)
      : directSteps(input, output, start),
    readyAt: after(start, output.total.prepTime),
    // Counted off the very definitions the full method is built from, so the
    // « voir les N étapes » of the aperçu can never promise a different run.
    totalSteps: visibleSteps(methodDefsFor(input.doughType, output)).length,
  };
}

function poolishSteps(
  output: ICalculatorOutput,
  start: Date,
): [IMethodPreviewStep, IMethodPreviewStep] {
  return [
    {
      at: start,
      bodyKey: STEPS_KEY + 'poolishMix',
      bodyParams: {},
      // The engine sends the honey into the poolish, not the frasage.
      ingredients: ingredients(output.poolish, [
        'flour',
        'water',
        'yeast',
        'honey',
      ]),
    },
    {
      at: after(start, output.poolish.prepTime),
      bodyKey: STEPS_KEY + 'poolishKnead',
      bodyParams: {},
      ingredients: ingredients(output.dough, METHOD_INGREDIENT_KEYS),
    },
  ];
}

function directSteps(
  input: ICalculatorInput,
  output: ICalculatorOutput,
  start: Date,
): [IMethodPreviewStep, IMethodPreviewStep] {
  return [
    {
      at: start,
      bodyKey: STEPS_KEY + 'directMix',
      bodyParams: {},
      ingredients: ingredients(output.dough, METHOD_INGREDIENT_KEYS),
    },
    {
      at: after(start, output.dough.prepTime),
      bodyKey: STEPS_KEY + 'directBalls',
      bodyParams: {
        count: input.nbPizzas,
        weight: Math.round(output.pizzaBalls.weight),
      },
      ingredients: [],
    },
  ];
}

/**
 * Display quantities for one narrated step, zero ingredients skipped — the
 * same rounding as the full method, so both tell the same grams.
 */
function ingredients(
  quantity: MethodQuantities,
  keys: MethodIngredientKey[],
): IMethodPreviewIngredient[] {
  return toMethodIngredients(quantity, keys);
}
