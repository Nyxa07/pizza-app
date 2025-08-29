import {
  SpotlightIcon,
  BeerIcon,
  CandyCaneIcon,
  DropletsIcon,
  WheatIcon,
  WandIcon,
  ThermometerSunIcon,
  ThermometerSnowflakeIcon,
  CookingPotIcon,
  BubblesIcon,
  UndoDotIcon,
  HandIcon,
  CircleIcon,
  ArrowDownUpIcon,
  EclipseIcon,
} from 'lucide-angular';
import { DoughResult } from '../services/calculator.service';
import { IRecipeDef } from '../../recipe/interfaces/recipe-def.interface';

export class PoolishDoughRecipe implements IRecipeDef {
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
  readonly CircleIcon = CircleIcon;
  readonly ArrowDownUpIcon = ArrowDownUpIcon;
  readonly EclipseIcon = EclipseIcon;
  constructor(private result: DoughResult) {}

  private get quantity() {
    return (
      this.result.dough ?? { flour: 0, water: 0, yeast: 0, honey: 0, salt: 0 }
    );
  }
  baseTranslationKey = 'calculator.recipe.poolishDough';

  ingredients = {
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
        icon: SpotlightIcon,
        value: this.quantity.salt,
        label: 'common.ingredients.salt',
        unit: 'g',
      },
    ],
  };

  method = {
    variables: {
      rtRestTime: this.result.dough?.rtRestTime,
      coldRestTime: this.result.dough?.coldRestTime,
      pizzaWeight: this.result.pizzaWeight,
    },
    items: [
      {
        icon: this.CookingPotIcon,
        helperDescriptions: 1,
      },
      {
        icon: this.BubblesIcon,
        helperDescriptions: 2,
      },
      {
        icon: this.WheatIcon,
        helperDescriptions: 1,
      },
      {
        icon: this.ArrowDownUpIcon,
        helperDescriptions: 2,
      },
      {
        icon: this.HandIcon,
        helperDescriptions: 2,
      },
      {
        icon: this.UndoDotIcon,
        helperDescriptions: 4,
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 2,
      },
      {
        icon: this.CircleIcon,
        helperDescriptions: 2,
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 0,
      },
      {
        icon: this.EclipseIcon,
        helperDescriptions: 5,
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 2,
      },
    ],
  };
}
