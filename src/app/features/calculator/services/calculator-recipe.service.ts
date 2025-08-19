import { Injectable } from '@angular/core';
import { CalculatorStateService } from './calculator-state.service';
import { map, Observable } from 'rxjs';
import {
  DropletsIcon,
  SpotlightIcon,
  BeerIcon,
  CandyCaneIcon,
  WheatIcon,
} from 'lucide-angular';
import { IRecipe } from 'src/app/features/recipe/interfaces/recipe.interface';

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

  poolishRecipe$: Observable<IRecipe> = this.calculatorState.result$.pipe(
    map((result) => ({
      ingredients: {
        title: 'calculator.results.poolishIngredients',
        items: [
          {
            icon: this.WheatIcon,
            value: result?.poolish?.flour ?? 0,
            label: 'common.ingredients.flour',
            unit: 'g',
          },
          {
            icon: this.DropletsIcon,
            value: result?.poolish?.water ?? 0,
            label: 'common.ingredients.water',
            unit: 'g',
          },
          {
            icon: this.BeerIcon,
            value: result?.poolish?.yeast ?? 0,
            label: 'common.ingredients.yeast',
            unit: 'g',
            numberFormat: '1.0-2',
          },
          {
            icon: this.CandyCaneIcon,
            value: result?.poolish?.honey ?? 0,
            label: 'common.ingredients.honey',
            unit: 'g',
          },
        ],
      },
      method: {
        title: 'calculator.results.poolishMethod',
        items: [
          {
            icon: this.WheatIcon,
            label: 'calculator.results.poolishMethod.flour',
          },
        ],
      },
    })),
  );

  doughRecipe$: Observable<IRecipe> = this.calculatorState.result$.pipe(
    map((result) => ({
      ingredients: {
        title: 'calculator.results.doughIngredients',
        items: [
          {
            icon: this.WheatIcon,
            value: result?.dough?.flour,
            label: 'common.ingredients.flour',
            unit: 'g',
          },
          {
            icon: this.DropletsIcon,
            value: result?.dough?.water,
            label: 'common.ingredients.water',
            unit: 'g',
          },
          {
            icon: this.BeerIcon,
            value: result?.dough?.yeast,
            label: 'common.ingredients.yeast',
            unit: 'g',
            numberFormat: '1.0-2',
          },
          {
            icon: this.CandyCaneIcon,
            value: result?.dough?.honey,
            label: 'common.ingredients.honey',
            unit: 'g',
          },
          {
            icon: this.SpotlightIcon,
            value: result?.dough?.salt,
            label: 'common.ingredients.salt',
            unit: 'g',
          },
        ],
      },
      method: {
        title: 'calculator.results.doughMethod',
        items: [],
      },
    })),
  );
}
