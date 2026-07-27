import type { IMethodIngredient } from './method.interface';

export interface IMethodPreviewStep {
  at: Date;
  bodyKey: string;
  bodyParams: Record<string, number>;
  /** The same grams, rounded the same way, as the full method's. */
  ingredients: IMethodIngredient[];
}

/**
 * The « aperçu de la Méthode » of the calculator forms (variant D): the two
 * first dated interventions, when the dough is ready, and how many steps the
 * full method holds.
 */
export interface IMethodPreview {
  steps: [IMethodPreviewStep, IMethodPreviewStep];
  readyAt: Date;
  totalSteps: number;
}
