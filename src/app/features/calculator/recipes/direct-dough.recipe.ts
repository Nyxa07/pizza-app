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
  ThermometerSnowflakeIcon,
  CircleIcon,
  EclipseIcon,
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
  readonly ThermometerSnowflakeIcon = ThermometerSnowflakeIcon;
  readonly UndoDotIcon = UndoDotIcon;
  readonly HandIcon = HandIcon;
  readonly CircleIcon = CircleIcon;
  readonly EclipseIcon = EclipseIcon;
  constructor(private result: DoughResult) {}

  private get quantity() {
    return (
      this.result.dough ?? { flour: 0, water: 0, yeast: 0, honey: 0, salt: 0 }
    );
  }

  ingredients = {
    title: 'calculator.recipe.directDough.ingredients.title',
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
    title: 'calculator.recipe.directDough.method.title',
    items: [
      {
        icon: this.WandIcon,
        label: 'calculator.recipe.directDough.method.steps.0.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.0.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.0.helper.descriptions.0',
            'calculator.recipe.directDough.method.steps.0.helper.descriptions.1',
          ],
        },
      },
      {
        icon: this.WheatIcon,
        label: 'calculator.recipe.directDough.method.steps.1.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.1.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.1.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.HandIcon,
        label: 'calculator.recipe.directDough.method.steps.2.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.2.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.2.helper.descriptions.0',
            'calculator.recipe.directDough.method.steps.2.helper.descriptions.1',
          ],
        },
      },
      {
        icon: this.CircleIcon,
        label: 'calculator.recipe.directDough.method.steps.3.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.3.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.3.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.ThermometerSunIcon,
        label: 'calculator.recipe.directDough.method.steps.4.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.4.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.4.helper.descriptions.0',
          ],
        },
      },
      {
        icon: this.UndoDotIcon,
        label: 'calculator.recipe.directDough.method.steps.5.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.5.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.5.helper.descriptions.0',
            'calculator.recipe.directDough.method.steps.5.helper.descriptions.1',
            'calculator.recipe.directDough.method.steps.5.helper.descriptions.2',
            'calculator.recipe.directDough.method.steps.5.helper.descriptions.3',
          ],
        },
      },
      {
        icon: this.ThermometerSunIcon,
        label: 'calculator.recipe.directDough.method.steps.6.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.6.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.6.helper.descriptions.0',
          ],
        },
        variables: {
          rtRestTime: this.result.dough?.rtRestTime,
        },
      },
      {
        icon: this.ThermometerSnowflakeIcon,
        label: 'calculator.recipe.directDough.method.steps.7.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.7.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.7.helper.descriptions.0',
          ],
        },
        variables: {
          coldRestTime: this.result.dough?.coldRestTime,
        },
      },
      {
        icon: this.EclipseIcon,
        label: 'calculator.recipe.directDough.method.steps.8.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.8.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.8.helper.descriptions.0',
            'calculator.recipe.directDough.method.steps.8.helper.descriptions.1',
            'calculator.recipe.directDough.method.steps.8.helper.descriptions.2',
            'calculator.recipe.directDough.method.steps.8.helper.descriptions.3',
            'calculator.recipe.directDough.method.steps.8.helper.descriptions.4',
          ],
        },
        variables: {
          pizzaWeight: this.result.pizzaWeight,
        },
      },
      {
        icon: this.ThermometerSunIcon,
        label: 'calculator.recipe.directDough.method.steps.9.title',
        helper: {
          title: 'calculator.recipe.directDough.method.steps.9.helper.title',
          descriptions: [
            'calculator.recipe.directDough.method.steps.9.helper.descriptions.0',
            'calculator.recipe.directDough.method.steps.9.helper.descriptions.1',
          ],
        },
      },
    ],
  };
}
