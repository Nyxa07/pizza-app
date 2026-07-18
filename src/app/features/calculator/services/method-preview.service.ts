import { Injectable } from '@angular/core';

import type { IRecipeDef } from '../../recipe/interfaces/recipe-def.interface';
import { DoughType } from '../enums/dough-type.enum';
import { ICalculatorInput } from '../interfaces/calculator-input.interface';
import {
  ICalculatorOutput,
  Quantity,
} from '../interfaces/calculator-output.interface';
import { DirectDoughRecipe } from '../recipes/direct-dough.recipe';
import { PoolishDoughRecipe } from '../recipes/poolish-dough.recipe';
import { PoolishRecipe } from '../recipes/poolish.recipe';

export type MethodIngredientKey =
  | 'flour'
  | 'water'
  | 'yeast'
  | 'salt'
  | 'honey'
  | 'oliveOil';

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

const STEPS_KEY = 'calculator.expert.method.steps.';
const QUARTER_HOUR_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

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
    const start = this.ceilToQuarterHour(now);
    const hasPoolish = input.doughType === DoughType.POOLISH;

    return {
      steps: hasPoolish
        ? this.poolishSteps(output, start)
        : this.directSteps(input, output, start),
      readyAt: this.after(start, output.total.prepTime),
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
        at: this.after(start, output.poolish.prepTime),
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
        at: this.after(start, output.dough.prepTime),
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
    quantity: Quantity,
    keys: MethodIngredientKey[],
  ): IMethodPreviewIngredient[] {
    return keys
      .map((key) => ({
        key,
        grams:
          key === 'yeast'
            ? Math.max(0.1, Math.round(quantity[key] * 10) / 10)
            : Math.round(quantity[key]),
      }))
      .filter(({ key, grams }) => quantity[key] > 0 && grams > 0);
  }

  private countMethodSteps(
    doughType: DoughType,
    output: ICalculatorOutput,
  ): number {
    const defs: IRecipeDef[] =
      doughType === DoughType.POOLISH
        ? [new PoolishRecipe(output), new PoolishDoughRecipe(output)]
        : [new DirectDoughRecipe(output)];

    return defs.reduce(
      (count, def) =>
        count + def.method.items.filter((item) => !item.hide).length,
      0,
    );
  }

  private ceilToQuarterHour(date: Date): Date {
    return new Date(
      Math.ceil(date.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS,
    );
  }

  private after(start: Date, hours: number): Date {
    return this.ceilToQuarterHour(new Date(start.getTime() + hours * HOUR_MS));
  }
}
