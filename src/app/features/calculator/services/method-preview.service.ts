import { Injectable } from '@angular/core';

import type {
  IMethodDef,
  MethodIngredientKey,
  MethodQuantities,
} from 'src/app/features/method/interfaces/method-def.interface';

import { DoughType } from '../enums/dough-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { DirectDoughMethod } from '../methods/direct-dough.method';
import { PoolishDoughMethod } from '../methods/poolish-dough.method';
import { PoolishMethod } from '../methods/poolish.method';
import { after, ceilToQuarterHour } from './method-clock';
import { toMethodIngredients } from './method.service';

export interface IMethodPreviewIngredient {
  key: MethodIngredientKey;
  grams: number;
}

export interface IMethodPreviewStep {
  at: Date;
  bodyKey: string;
  bodyParams: Record<string, number>;
  ingredients: IMethodPreviewIngredient[];
}

/** The « aperçu de la Méthode » of the Expert screen (variant D). */
export interface IMethodPreview {
  steps: [IMethodPreviewStep, IMethodPreviewStep];
  readyAt: Date;
  totalSteps: number;
}

const STEPS_KEY = 'calculator.shared.method.steps.';

const ALL_INGREDIENTS: MethodIngredientKey[] = [
  'flour',
  'water',
  'yeast',
  'salt',
  'honey',
  'oliveOil',
];

/**
 * Projects the engine's relative timings onto the clock: the two first
 * dated interventions of the Dough method, the moment the dough is ready,
 * and how many steps the full method holds. Times land on quarter-hours —
 * this is a plan being narrated, not a stopwatch.
 */
@Injectable({ providedIn: 'root' })
export class MethodPreviewService {
  buildPreview(
    input: ICalculatorInput,
    output: ICalculatorOutput,
    now: Date,
  ): IMethodPreview {
    const start = ceilToQuarterHour(now);
    const hasPoolish = input.doughType === DoughType.POOLISH;

    return {
      steps: hasPoolish
        ? this.poolishSteps(output, start)
        : this.directSteps(input, output, start),
      readyAt: after(start, output.total.prepTime),
      totalSteps: this.countMethodSteps(input.doughType, output),
    };
  }

  private poolishSteps(
    output: ICalculatorOutput,
    start: Date,
  ): [IMethodPreviewStep, IMethodPreviewStep] {
    return [
      {
        at: start,
        bodyKey: STEPS_KEY + 'poolishMix',
        bodyParams: {},
        // The engine sends the honey into the poolish, not the frasage.
        ingredients: this.ingredients(output.poolish, [
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
        ingredients: this.ingredients(output.dough, ALL_INGREDIENTS),
      },
    ];
  }

  private directSteps(
    input: ICalculatorInput,
    output: ICalculatorOutput,
    start: Date,
  ): [IMethodPreviewStep, IMethodPreviewStep] {
    return [
      {
        at: start,
        bodyKey: STEPS_KEY + 'directMix',
        bodyParams: {},
        ingredients: this.ingredients(output.dough, ALL_INGREDIENTS),
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
   * Display quantities for one narrated step, zero ingredients skipped.
   * Yeast keeps one decimal and never rounds down to nothing — a poolish
   * without its pinch of yeast would narrate a lie.
   */
  private ingredients(
    quantity: MethodQuantities,
    keys: MethodIngredientKey[],
  ): IMethodPreviewIngredient[] {
    return toMethodIngredients(quantity, keys);
  }

  private countMethodSteps(
    doughType: DoughType,
    output: ICalculatorOutput,
  ): number {
    const defs: IMethodDef[] =
      doughType === DoughType.POOLISH
        ? [new PoolishMethod(output), new PoolishDoughMethod(output)]
        : [new DirectDoughMethod(output)];

    return defs.reduce(
      (count, def) => count + def.steps.filter((step) => !step.hide).length,
      0,
    );
  }
}
