import {
  SpotlightIcon,
  BeerIcon,
  CandyCaneIcon,
  DropletsIcon,
  WheatIcon,
  WandIcon,
  ThermometerSunIcon,
  ThermometerSnowflakeIcon,
} from 'lucide-angular';
import { IRecipe } from '../../recipe/interfaces/recipe.interface';
import { DoughResult } from '../services/calculator.service';

export class PoolishRecipe implements IRecipe {
  readonly WheatIcon = WheatIcon;
  readonly DropletsIcon = DropletsIcon;
  readonly BeerIcon = BeerIcon;
  readonly CandyCaneIcon = CandyCaneIcon;
  readonly SpotlightIcon = SpotlightIcon;
  readonly WandIcon = WandIcon;
  readonly ThermometerSunIcon = ThermometerSunIcon;
  readonly ThermometerSnowflakeIcon = ThermometerSnowflakeIcon;

  constructor(private result: DoughResult) {}

  private get quantity() {
    return (
      this.result.poolish ?? { flour: 0, water: 0, yeast: 0, honey: 0, salt: 0 }
    );
  }

  ingredients = {
    title: 'calculator.recipe.poolish.ingredients.title',
    items: [
      {
        icon: this.WheatIcon,
        value: this.quantity.flour,
        label: 'common.ingredients.flour',
        unit: 'g',
      },
      {
        icon: DropletsIcon,
        value: this.quantity.water,
        label: 'common.ingredients.water',
        unit: 'g',
      },
      {
        icon: BeerIcon,
        value: this.quantity.yeast,
        label: 'common.ingredients.yeast',
        unit: 'g',
        numberFormat: '1.0-2',
      },
      {
        icon: CandyCaneIcon,
        value: this.quantity.honey,
        label: 'common.ingredients.honey',
        unit: 'g',
      },
    ],
  };

  method = {
    title: 'calculator.recipe.poolish.method.title',
    items: [
      {
        icon: this.WandIcon,
        label: 'calculator.recipe.poolish.method.steps.0.title',
        helper: {
          title: 'calculator.recipe.poolish.method.steps.0.helper.title',
          descriptions: [
            'calculator.recipe.poolish.method.steps.0.helper.descriptions.0',
            'calculator.recipe.poolish.method.steps.0.helper.descriptions.1',
          ],
        },
      },
      {
        icon: this.WheatIcon,
        label: 'calculator.recipe.poolish.method.steps.1.title',
        helper: {
          title: 'calculator.recipe.poolish.method.steps.1.helper.title',
          descriptions: [
            'calculator.recipe.poolish.method.steps.1.helper.description',
          ],
        },
      },
      {
        icon: this.ThermometerSunIcon,
        label: 'calculator.recipe.poolish.method.steps.2.title',
        helper: {
          title: 'calculator.recipe.poolish.method.steps.2.helper.title',
          descriptions: [
            'calculator.recipe.poolish.method.steps.2.helper.descriptions.0',
          ],
        },
        variables: { rtRestTime: this.result.poolish?.rtRestTime },
      },
      {
        icon: this.ThermometerSnowflakeIcon,
        label: 'calculator.recipe.poolish.method.steps.3.title',
        helper: {
          title: 'calculator.recipe.poolish.method.steps.3.helper.title',
          descriptions: [
            'calculator.recipe.poolish.method.steps.3.helper.descriptions.0',
          ],
        },
        variables: { coldRestTime: this.result.poolish?.coldRestTime },
      },
    ],
  };
}
