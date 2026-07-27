import type { LucideIconData } from 'lucide-angular';

import type { MethodIngredientKey } from './method-def.interface';

/** Display grams for one ingredient (yeast kept to the centigram). */
export interface IMethodIngredient {
  key: MethodIngredientKey;
  grams: number;
}

export interface IMethodStepHelper {
  title: string;
  descriptions: string[];
}

export interface IMethodStep {
  icon: LucideIconData;
  /** Clock time of the milestone; null for the steps that simply follow. */
  at: Date | null;
  title: string;
  variables: Record<string, number | string | boolean>;
  helper: IMethodStepHelper | null;
  ingredients: IMethodIngredient[];
}

/** The weigh-in of one part of the method (the poolish, the dough…). */
export interface IMethodSection {
  title: string;
  ingredients: IMethodIngredient[];
}

/**
 * The full Dough method, projected onto the clock: the weigh-in per part
 * and the dated run of steps, from the first mix to the bake.
 */
export interface IMethod {
  sections: IMethodSection[];
  steps: IMethodStep[];
  startAt: Date;
  readyAt: Date;
}
