import {
  SpotlightIcon,
  BeerIcon,
  CandyCaneIcon,
  DropletsIcon,
  WheatIcon,
  WandIcon,
  ThermometerSunIcon,
  UndoDotIcon,
  HandIcon,
} from 'lucide-angular';
import { IRecipe } from '../../recipe/interfaces/recipe.interface';
import { DoughResult } from '../services/calculator.service';

export class DirectDoughRecipe implements IRecipe {
  readonly WheatIcon = WheatIcon;
  readonly DropletsIcon = DropletsIcon;
  readonly BeerIcon = BeerIcon;
  readonly CandyCaneIcon = CandyCaneIcon;
  readonly SpotlightIcon = SpotlightIcon;
  readonly WandIcon = WandIcon;
  readonly ThermometerSunIcon = ThermometerSunIcon;
  readonly UndoDotIcon = UndoDotIcon;
  readonly HandIcon = HandIcon;

  constructor(private result: DoughResult) {}

  private get quantity() {
    return (
      this.result.poolish ?? { flour: 0, water: 0, yeast: 0, honey: 0, salt: 0 }
    );
  }

  ingredients = {
    title: 'calculator.recipe.dough.ingredients.title',
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
      {
        icon: SpotlightIcon,
        value: this.quantity.salt,
        label: 'common.ingredients.salt',
        unit: 'g',
      },
    ],
  };

  method = {
    title: 'calculator.recipe.dough.method.title',
    items: [
      {
        icon: this.WandIcon,
        label: 'calculator.recipe.dough.method.steps.0.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.0.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.0.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.WheatIcon,
        label: 'calculator.recipe.dough.method.steps.1.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.1.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.1.helper.description',
          ],
        },
      },
      {
        icon: this.HandIcon,
        label: 'calculator.recipe.dough.method.steps.2.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.2.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.2.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.UndoDotIcon,
        label: 'calculator.recipe.dough.method.steps.4.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.4.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.4.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.ThermometerSunIcon,
        label: 'calculator.recipe.dough.method.steps.5.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.5.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.5.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.UndoDotIcon,
        label: 'calculator.recipe.dough.method.steps.6.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.6.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.6.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.ThermometerSunIcon,
        label: 'calculator.recipe.dough.method.steps.7.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.7.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.7.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.UndoDotIcon,
        label: 'calculator.recipe.dough.method.steps.8.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.8.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.8.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.ThermometerSunIcon,
        label: 'calculator.recipe.dough.method.steps.9.title',
        helper: {
          title: 'calculator.recipe.dough.method.steps.9.helper.title',
          descriptions: [
            'calculator.recipe.dough.method.steps.9.helper.descriptions.0',
          ],
        },
      },
    ],
  };
}
