import type { ICalculatorInput } from '../../calculator/interfaces/calculator-input.interface';

/** A replaceable, bundled visual with its licence provenance. */
export interface PizzaRecipeImage {
  path: string;
  sourceUrl: string;
  photographer: string;
}

/** A calculator preset a curated Recipe can explicitly reference. */
export interface SuggestedDough {
  id: string;
  input: Readonly<ICalculatorInput>;
}

/** Locale-independent data for one topped-pizza Recipe. */
export interface PizzaRecipeDefinition {
  id: string;
  image: Readonly<PizzaRecipeImage>;
  suggestedDoughId: string;
}

/** Editorial content that must ship in every supported locale. */
export interface PizzaRecipeContent {
  name: string;
  category: string;
  summary: string;
  description: string;
  imageAlt: string;
  doughSuggestion: string;
  ingredients: readonly string[];
  steps: readonly string[];
}

export type PizzaRecipeTranslations = Record<string, PizzaRecipeContent>;

/** The localized, ready-to-render public catalog model. */
export interface PizzaRecipe extends PizzaRecipeDefinition {
  content: Readonly<PizzaRecipeContent>;
  suggestedDough: Readonly<SuggestedDough>;
}
