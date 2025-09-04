import { Injectable } from '@angular/core';
import { IRecipeDef } from '../interfaces/recipe-def.interface';
import { IRecipe } from '../interfaces/recipe.interface';

@Injectable({
  providedIn: 'root',
})
export class RecipeDefConverterService {
  constructor() {}

  convert(recipeDef: IRecipeDef): IRecipe {
    return {
      ingredients: {
        ...recipeDef.ingredients,
        title: `${recipeDef.baseTranslationKey}.ingredients.title`,
      },
      method: {
        title: `${recipeDef.baseTranslationKey}.method.title`,
        items: recipeDef.method.items
          .map((item, index) => ({
            icon: item.icon,
            label: `${recipeDef.baseTranslationKey}.method.steps.${index}.title`,
            helper: {
              title: `${recipeDef.baseTranslationKey}.method.steps.${index}.helper.title`,
              descriptions: Array.from(
                { length: item.helperDescriptions },
                (_, i) =>
                  `${recipeDef.baseTranslationKey}.method.steps.${index}.helper.descriptions.${i}`,
              ),
            },
            variables: {
              ...recipeDef.method.variables,
              ...(item.variables ?? {}),
            },
          }))
          // Filter out items that are marked as hidden after mapping because index is used
          // to access translation keys and can not change before mapping
          .filter((_, index) => !recipeDef.method.items[index].hide),
      },
    };
  }
}
