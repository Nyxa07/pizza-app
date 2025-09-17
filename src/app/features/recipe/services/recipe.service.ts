import { Injectable } from '@angular/core';
import { IRecipe } from '../interfaces/recipe.interface';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(private translateService: TranslateService) {}

  /** Remove any HTML tags from a translated string */
  private stripHtml(value: string): string {
    return value ? value.replace(/<[^>]*>/g, '').trim() : value;
  }

  getRecipeText(
    recipe: IRecipe,
    options = {
      withHelperDescriptions: false,
      onlyIngredients: false,
    },
  ): string {
    if (!recipe) return '';

    // 1. Ingredients list --------------------------------------------------
    const ingredientsTitle = this.stripHtml(
      this.translateService.instant('common.recipe.ingredients'),
    );
    const ingredientsLines: string[] = [ingredientsTitle + ':'];

    recipe.ingredients.items
      .filter((item) => item.value > 0)
      .forEach((item) => {
        const value = item.value?.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        });
        const unit = item.unit ?? '';
        const label = this.stripHtml(this.translateService.instant(item.title));
        const description = item.description
          ? ` – ${this.stripHtml(this.translateService.instant(item.description))}`
          : '';
        ingredientsLines.push(`• ${label}: ${value} ${unit}${description}`);
      });

    // 2. Method steps ------------------------------------------------------
    const methodTitle = this.stripHtml(
      this.translateService.instant('common.recipe.method'),
    );
    const methodLines: string[] = ['\n' + methodTitle + ':'];

    recipe.method.items.forEach((step, idx) => {
      const stepLabel = this.stripHtml(
        this.translateService.instant(step.title, step.variables),
      );

      // Main step line
      methodLines.push(`${idx + 1}. ${stepLabel}`);

      // Append helper descriptions as an indented sub-list (if any)
      if (step.helper?.descriptions?.length && options.withHelperDescriptions) {
        step.helper.descriptions.forEach((desc) => {
          const descText = this.stripHtml(
            this.translateService.instant(desc, step.variables),
          );
          methodLines.push(`      • ${descText}`);
        });
      }
    });

    return [
      ...ingredientsLines,
      '',
      ...(options.onlyIngredients ? [] : methodLines),
    ].join('\n');
  }
}
