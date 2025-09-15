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
  FlaskRoundIcon,
} from 'lucide-angular';
import { IRecipeDef } from '../../recipe/interfaces/recipe-def.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';

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
  readonly FlaskRoundIcon = FlaskRoundIcon;
  readonly baseStepsKey = 'calculator.recipe.steps.';

  constructor(private result: ICalculatorOutput) {}

  private get quantity() {
    return (
      this.result.dough ?? { flour: 0, water: 0, yeast: 0, honey: 0, salt: 0 }
    );
  }

  private getStepsKey(step: string) {
    return this.baseStepsKey + step;
  }

  title = 'calculator.recipe.titles.poolishDough';

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
        icon: SpotlightIcon,
        value: this.quantity.salt,
        title: 'common.ingredients.salt',
        unit: 'g',
      },
      {
        icon: FlaskRoundIcon,
        value: this.quantity.oliveOil,
        title: 'common.ingredients.oliveOil',
        unit: 'g',
      },
    ],
  };

  method = {
    variables: {
      rtRestTime: Math.round(this.result.dough?.rtRestTime ?? 0),
      coldRestTime: Math.round(this.result.dough?.coldRestTime ?? 0),
      pizzaWeight: this.result.pizzaBalls.weight,
    },
    items: [
      {
        icon: this.CookingPotIcon,
        helperDescriptions: 1,
        hide: !this.result.poolish?.coldRestTime,
        baseTranslationKey: this.getStepsKey('takeOutPoolish'),
      },
      {
        icon: this.BubblesIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('addWaterSalt'),
      },
      {
        icon: this.WheatIcon,
        helperDescriptions: 1,
        baseTranslationKey: this.getStepsKey('addFlourPoolishDough'),
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
        icon: this.UndoDotIcon,
        helperDescriptions: 4,
        baseTranslationKey: this.getStepsKey('foldAndShape'),
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('shortRestPoolishDough'),
      },
      {
        icon: this.CircleIcon,
        helperDescriptions: 2,
        baseTranslationKey: this.getStepsKey('shapeAsBall'),
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 0,
        baseTranslationKey: this.getStepsKey('restOneHour'),
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
