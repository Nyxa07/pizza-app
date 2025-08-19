import { Injectable } from '@angular/core';
import { CalculatorStateService } from './calculator-state.service';
import { filter, map, Observable } from 'rxjs';
import {
  DropletsIcon,
  SpotlightIcon,
  BeerIcon,
  CandyCaneIcon,
  WheatIcon,
  WandIcon,
  ThermometerSunIcon,
  ThermometerSnowflakeIcon,
  CookingPotIcon,
  BubblesIcon,
  UndoDotIcon,
  HandIcon,
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
  readonly WandIcon = WandIcon;
  readonly ThermometerSunIcon = ThermometerSunIcon;
  readonly ThermometerSnowflakeIcon = ThermometerSnowflakeIcon;
  readonly CookingPotIcon = CookingPotIcon;
  readonly BubblesIcon = BubblesIcon;
  readonly UndoDotIcon = UndoDotIcon;
  readonly HandIcon = HandIcon;

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
            { icon: this.WandIcon },
            { icon: this.WheatIcon },
            {
              icon: this.ThermometerSunIcon,
              variables: { rtRestTime: result.poolish?.rtRestTime },
            },
            {
              icon: this.ThermometerSnowflakeIcon,
              variables: { coldRestTime: result.poolish?.coldRestTime },
            },
          ].map((data, index) => ({
            icon: data.icon,
            label: `calculator.recipe.poolish.method.steps.${index}.title`,
            helper: {
              title: `calculator.recipe.poolish.method.steps.${index}.helper.title`,
              description: `calculator.recipe.poolish.method.steps.${index}.helper.description`,
            },
            variables: data.variables,
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
          { icon: this.CookingPotIcon },
          { icon: this.BubblesIcon },
          { icon: this.WheatIcon },
          { icon: this.UndoDotIcon },
          { icon: this.HandIcon },
          { icon: this.UndoDotIcon },
          { icon: this.ThermometerSunIcon },
          { icon: this.UndoDotIcon },
          { icon: this.ThermometerSunIcon },
          { icon: this.UndoDotIcon },
          { icon: this.ThermometerSunIcon },
        ].map((data, index) => ({
          icon: data.icon,
          label: `calculator.recipe.poolishDough.method.steps.${index}.title`,
          helper: {
            title: `calculator.recipe.poolishDough.method.steps.${index}.helper.title`,
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
          { icon: this.WandIcon },
          { icon: this.WheatIcon },
          { icon: this.HandIcon },
          { icon: this.UndoDotIcon },
          { icon: this.ThermometerSunIcon },
          { icon: this.UndoDotIcon },
          { icon: this.ThermometerSunIcon },
          { icon: this.UndoDotIcon },
          { icon: this.ThermometerSunIcon },
        ].map((data, index) => ({
          icon: data.icon,
          label: `calculator.recipe.directDough.method.steps.${index}.title`,
          helper: {
            title: `calculator.recipe.directDough.method.steps.${index}.helper.title`,
            description: `calculator.recipe.directDough.method.steps.${index}.helper.description`,
          },
        })),
      },
    })),
  );
}
