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
import { IRecipeDef } from '../../recipe/interfaces/recipe-def.interface';
import { ICalculatorOutput } from '../interfaces/calculator-output.interface';

export class PoolishRecipe implements IRecipeDef {
  readonly WheatIcon = WheatIcon;
  readonly DropletsIcon = DropletsIcon;
  readonly BeerIcon = BeerIcon;
  readonly CandyCaneIcon = CandyCaneIcon;
  readonly SpotlightIcon = SpotlightIcon;
  readonly WandIcon = WandIcon;
  readonly ThermometerSunIcon = ThermometerSunIcon;
  readonly ThermometerSnowflakeIcon = ThermometerSnowflakeIcon;

  constructor(private result: ICalculatorOutput) {}

  private get quantity() {
    return (
      this.result.poolish ?? { flour: 0, water: 0, yeast: 0, honey: 0, salt: 0 }
    );
  }
  readonly baseStepsKey = 'calculator.recipe.steps.';

  private getStepsKey(step: string) {
    return this.baseStepsKey + step;
  }

  title = 'calculator.recipe.titles.poolish';

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
    ],
  };

  method = {
    variables: {
      rtRestTime: Math.round(this.result.poolish?.rtRestTime ?? 0),
      coldRestTime: Math.round(this.result.poolish?.coldRestTime ?? 0),
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
        baseTranslationKey: this.getStepsKey('addFlourPoolish'),
      },
      {
        icon: this.ThermometerSunIcon,
        helperDescriptions: 1,
        baseTranslationKey: this.getStepsKey('restRT'),
      },
      {
        icon: this.ThermometerSnowflakeIcon,
        helperDescriptions: 1,
        hide: !this.result.poolish?.coldRestTime,
        baseTranslationKey: this.getStepsKey('restCold'),
      },
    ],
  };
}
