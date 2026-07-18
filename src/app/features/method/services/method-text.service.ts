import { Injectable, inject } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import type {
  IMethod,
  IMethodIngredient,
} from '../interfaces/method.interface';

export interface MethodTextOptions {
  withHelperDescriptions: boolean;
  onlyIngredients: boolean;
}

/** Plain-text projection of a Dough method for the native share sheet. */
@Injectable({ providedIn: 'root' })
export class MethodTextService {
  private readonly translate = inject(TranslateService);

  getText(method: IMethod, options: MethodTextOptions): string {
    const ingredientLines = method.sections.flatMap((section) => [
      `${this.text(section.title)}:`,
      ...section.ingredients.map(
        (ingredient) =>
          `• ${this.text('common.ingredients.' + ingredient.key)}: ${this.grams(ingredient)} g`,
      ),
      '',
    ]);

    const methodLines = method.steps.flatMap((step, index) => {
      const lines = [`${index + 1}. ${this.text(step.title, step.variables)}`];

      if (options.withHelperDescriptions && step.helper) {
        lines.push(
          ...step.helper.descriptions.map(
            (description) => `   • ${this.text(description, step.variables)}`,
          ),
        );
      }

      return lines;
    });

    return [
      `${this.text('calculator.method.ingredientsTitle')}:`,
      ...ingredientLines,
      ...(options.onlyIngredients
        ? []
        : [`${this.text('calculator.method.stepsTitle')}:`, ...methodLines]),
    ]
      .join('\n')
      .trim();
  }

  private grams(ingredient: IMethodIngredient): string {
    return ingredient.grams.toLocaleString(
      this.translate.currentLang || undefined,
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: ingredient.key === 'yeast' ? 1 : 0,
      },
    );
  }

  private text(
    key: string,
    params?: Record<string, number | string | boolean>,
  ): string {
    const value = this.translate.instant(key, params);
    return value.replace(/<[^>]*>/g, '').trim();
  }
}
