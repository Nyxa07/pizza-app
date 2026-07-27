import { Injectable, inject } from '@angular/core';

import { Locales } from 'src/app/features/settings/enums/locales.enum';
import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';
import enRecipes from 'src/assets/i18n/en/recipes.json';
import frRecipes from 'src/assets/i18n/fr/recipes.json';

import { CalculatorPaths } from '../../calculator/paths/calculator-paths.service';
import type {
  PizzaRecipe,
  PizzaRecipeContent,
  PizzaRecipeDefinition,
  PizzaRecipeTranslations,
  SuggestedDough,
} from '../interfaces/pizza-recipe.interface';
import { PIZZA_RECIPE_CATALOG, SUGGESTED_DOUGHS } from '../recipes.catalog';

const CONTENT: Record<Locales, PizzaRecipeTranslations> = {
  [Locales.EN]: enRecipes,
  [Locales.FR]: frRecipes,
};

/** Public API for the bundled, localized topped-pizza Recipe catalog. */
@Injectable({ providedIn: 'root' })
export class RecipeCatalogService {
  private readonly localeManager = inject(LocaleManagerService);
  private readonly paths = inject(CalculatorPaths);

  list(): readonly PizzaRecipe[] {
    return PIZZA_RECIPE_CATALOG.map((definition) => this.localize(definition));
  }

  get(id: string): PizzaRecipe | undefined {
    const definition = PIZZA_RECIPE_CATALOG.find(
      (candidate) => candidate.id === id,
    );
    return definition ? this.localize(definition) : undefined;
  }

  /** Explicitly starts a calculation from the detached dough preset. */
  prepareSuggestedDough(id: string): boolean {
    const recipe = this.get(id);
    if (!recipe) {
      return false;
    }
    this.paths.startFrom(recipe.suggestedDough.input);
    return true;
  }

  private localize(definition: PizzaRecipeDefinition): PizzaRecipe {
    const content: PizzaRecipeContent | undefined =
      CONTENT[this.localeManager.getLocale()][definition.id];
    const suggestedDough: SuggestedDough | undefined = SUGGESTED_DOUGHS.find(
      (candidate) => candidate.id === definition.suggestedDoughId,
    );

    if (!content || !suggestedDough) {
      throw new Error(`Incomplete Recipe catalog entry: ${definition.id}`);
    }

    return { ...definition, content, suggestedDough };
  }
}
