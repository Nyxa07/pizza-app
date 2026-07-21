import type { LucideIconData } from 'lucide-angular';

/** The ingredients a Dough method can narrate, in weigh-in order. */
export type MethodIngredientKey =
  | 'flour'
  | 'water'
  | 'yeast'
  | 'salt'
  | 'honey'
  | 'oliveOil';

/** Raw grams per ingredient, straight from the engine's quantities. */
export type MethodQuantities = Partial<Record<MethodIngredientKey, number>>;

export interface IMethodDefStep {
  icon: LucideIconData;
  baseTranslationKey: string;
  helperDescriptions: number;
  variables?: Record<string, number | string | boolean>;
  hide?: boolean;
  /**
   * Hours after the method starts at which the cook must act. Only the
   * steps that summon the cook to the kitchen carry one (mix, to/from the
   * fridge, frasage, balling, bake); rests are the gaps between them.
   */
  atHours?: number;
  /** The quantities the cook engages at this milestone. */
  ingredients?: MethodQuantities;
}

/**
 * One part of a Dough method (the poolish, the dough…) as declared by the
 * calculator: its weigh-in and its steps, timed relative to the start.
 */
export interface IMethodDef {
  title: string;
  quantities: MethodQuantities;
  variables: Record<string, number | string | boolean>;
  steps: IMethodDefStep[];
}
