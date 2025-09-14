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
      title: `${recipeDef.title}`,
      ingredients: {
        items: recipeDef.ingredients.items.map((item) => ({
          icon: item.icon,
          title: `${item.title}`,
          value: item.value,
          unit: item.unit,
        })),
      },
      method: {
        items: recipeDef.method.items
          .filter((item) => !item.hide)
          .map((item) => ({
            icon: item.icon,
            title: `${item.baseTranslationKey}.title`,
            helper: {
              title: `${item.baseTranslationKey}.helper.title`,
              descriptions: Array.from(
                { length: item.helperDescriptions },
                (_, i) => `${item.baseTranslationKey}.helper.descriptions.${i}`,
              ),
            },
            variables: {
              ...recipeDef.method.variables,
              ...(item.variables ?? {}),
            },
          })),
      },
    };
  }
}
