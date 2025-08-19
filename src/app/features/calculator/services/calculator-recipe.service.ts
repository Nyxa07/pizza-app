import { Injectable } from '@angular/core';
import { CalculatorStateService } from './calculator-state.service';
import { filter, map, Observable } from 'rxjs';
import {
  DropletsIcon,
  SpotlightIcon,
  BeerIcon,
  CandyCaneIcon,
  WheatIcon,
} from 'lucide-angular';
import { IRecipe } from 'src/app/features/recipe/interfaces/recipe.interface';
import { Quantity } from './calculator.service';

@Injectable({
  providedIn: 'root',
})
export class CalculatorRecipeService {
  readonly WheatIcon = WheatIcon;
  readonly DropletsIcon = DropletsIcon;
  readonly BeerIcon = BeerIcon;
  readonly CandyCaneIcon = CandyCaneIcon;
  readonly SpotlightIcon = SpotlightIcon;

  constructor(private calculatorState: CalculatorStateService) {}

  getIngredientItems(quantity: Quantity) {
    return [
      {
        icon: this.WheatIcon,
        value: quantity.flour,
        label: 'common.ingredients.flour',
        unit: 'g',
      },
      {
        icon: this.DropletsIcon,
        value: quantity.water,
        label: 'common.ingredients.water',
        unit: 'g',
      },
      {
        icon: this.BeerIcon,
        value: quantity.yeast,
        label: 'common.ingredients.yeast',
        unit: 'g',
        numberFormat: '1.0-2',
      },
      {
        icon: this.CandyCaneIcon,
        value: quantity.honey,
        label: 'common.ingredients.honey',
        unit: 'g',
      },
      {
        icon: this.SpotlightIcon,
        value: quantity.salt,
        label: 'common.ingredients.salt',
        unit: 'g',
      },
    ];
  }

  poolishRecipe$: Observable<IRecipe> = this.calculatorState.result$.pipe(
    filter((result) => !!result?.poolish),
    map((result) => {
      return {
        ingredients: {
          title: 'calculator.recipe.poolish.ingredients.title',
          items: result.poolish ? this.getIngredientItems(result.poolish) : [],
        },
        method: {
          title: 'calculator.recipe.poolish.method.title',
          items: [
            this.WheatIcon,
            this.WheatIcon,
            this.WheatIcon,
            this.WheatIcon,
          ].map((icon, index) => ({
            icon,
            label: `calculator.recipe.poolish.method.steps.${index}.title`,
            description: `calculator.recipe.poolish.method.steps.${index}.description`,
            helper: {
              title: `calculator.recipe.poolish.method.steps.${index}.title`,
              description: `calculator.recipe.poolish.method.steps.${index}.helper.description`,
            },
          })),
        },
      };
    }),
  );

  poolishDoughRecipe$: Observable<IRecipe> = this.calculatorState.result$.pipe(
    filter((result) => !!result?.poolish),
    map((result) => ({
      ingredients: {
        title: 'calculator.recipe.poolishDough.ingredients.title',
        items: result.dough ? this.getIngredientItems(result.dough) : [],
      },
      method: {
        title: 'calculator.recipe.poolishDough.method.title',
        items: [
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
        ].map((icon, index) => ({
          icon,
          label: `calculator.recipe.poolishDough.method.steps.${index}.title`,
          description: `calculator.recipe.poolishDough.method.steps.${index}.description`,
          helper: {
            title: `calculator.recipe.poolishDough.method.steps.${index}.title`,
            description: `calculator.recipe.poolishDough.method.steps.${index}.helper.description`,
          },
        })),
      },
    })),
  );

  directDoughRecipe$: Observable<IRecipe> = this.calculatorState.result$.pipe(
    map((result) => ({
      ingredients: {
        title: 'calculator.recipe.directDough.ingredients.title',
        items: result.dough ? this.getIngredientItems(result.dough) : [],
      },
      method: {
        title: 'calculator.recipe.directDough.method.title',
        items: [
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
          this.WheatIcon,
        ].map((icon, index) => ({
          icon,
          label: `calculator.recipe.directDough.method.steps.${index}.title`,
          description: `calculator.recipe.directDough.method.steps.${index}.description`,
          helper: {
            title: `calculator.recipe.directDough.method.steps.${index}.title`,
            description: `calculator.recipe.directDough.method.steps.${index}.helper.description`,
          },
        })),
      },
    })),
  );
}
