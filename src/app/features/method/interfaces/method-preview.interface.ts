import type { MethodIngredientKey } from './method-def.interface';

/** Display grams for one ingredient of a narrated step. */
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
