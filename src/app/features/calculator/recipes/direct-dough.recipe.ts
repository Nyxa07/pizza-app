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
  CookingPotIcon,
  ArrowDownUpIcon,
} from 'lucide-angular';
import { DoughResult } from '../services/calculator.service';
import { IRecipeDef } from '../../recipe/interfaces/recipe-def.interface';

export class DirectDoughRecipe implements IRecipeDef {
  readonly CookingPotIcon = CookingPotIcon;
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
  readonly ArrowDownUpIcon = ArrowDownUpIcon;
  constructor(private result: DoughResult) {}

  private get quantity() {
    return (
      this.result.dough ?? { flour: 0, water: 0, yeast: 0, honey: 0, salt: 0 }
    );
  }

  readonly baseStepsKey = 'calculator.recipe.steps.';

  private getStepsKey(step: string) {
    return this.baseStepsKey + step;
  }

  title = 'calculator.recipe.titles.directDough';

  ingredients = {
    items: [
      {
        icon: this.WheatIcon,
        value: this.quantity.flour,
        title: 'common.ingredients.flour',
        unit: 'g',
      },
      {
        icon: DropletsIcon,
        value: this.quantity.water,
        title: 'common.ingredients.water',
        unit: 'g',
      },
      {
        icon: BeerIcon,
        value: this.quantity.yeast,
        title: 'common.ingredients.yeast',
        unit: 'g',
        numberFormat: '1.0-2',
      },
      {
        icon: CandyCaneIcon,
        value: this.quantity.honey,
        title: 'common.ingredients.honey',
        unit: 'g',
      },
      {
        icon: SpotlightIcon,
        value: this.quantity.salt,
        title: 'common.ingredients.salt',
        unit: 'g',
      },
    ],
  };

  method = {
    variables: {
      rtRestTime: Math.round(this.result.dough?.rtRestTime ?? 0),
      coldRestTime: Math.round(this.result.dough?.coldRestTime ?? 0),
      pizzaWeight: this.result.pizzaWeight,
    },
    items: [
      {
        icon: this.WandIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('mixIngredients'),
      },
      {
        icon: this.WheatIcon,
        helperDescriptions: 1,
        baseTranslationKey: this.getStepsKey('addFlourSalt'),
      },
      {
        icon: this.ArrowDownUpIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('transferDough'),
      },
      {
        icon: this.HandIcon,
        helperDescriptions: 3,
        baseTranslationKey: this.getStepsKey('knead'),
      },
      {
        icon: this.CircleIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('shapeAsBall'),
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('shortRestDirectDough'),
      },
      {
        icon: this.UndoDotIcon,
        helperDescriptions: 4,
        baseTranslationKey: this.getStepsKey('foldAndShape'),
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('restRT'),
      },
      {
        icon: this.ThermometerSnowflakeIcon,
        helperDescriptions: 3,
        hide: !this.result.dough?.coldRestTime,
        baseTranslationKey: this.getStepsKey('restCold'),
      },
      {
        icon: this.CookingPotIcon,
        helperDescriptions: 1,
        hide: !this.result.dough?.coldRestTime,
        baseTranslationKey: this.getStepsKey('takeOutDough'),
      },
      {
        icon: this.EclipseIcon,
        helperDescriptions: 5,
        baseTranslationKey: this.getStepsKey('formBalls'),
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 2,
        variables: {
          rtRestTime: Math.round(this.result.pizzaBalls.rtRestTime),
        },
        baseTranslationKey: this.getStepsKey('finalRest'),
        hide: !Math.round(this.result.pizzaBalls.rtRestTime),
      },
    ],
  };
}
