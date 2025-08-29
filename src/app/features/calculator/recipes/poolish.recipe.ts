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
import { DoughResult } from '../services/calculator.service';
import { IRecipeDef } from '../../recipe/interfaces/recipe-def.interface';

export class PoolishRecipe implements IRecipeDef {
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
  baseTranslationKey = 'calculator.recipe.poolish';

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
    variables: {
      rtRestTime: Math.round(this.result.poolish?.rtRestTime ?? 0),
      coldRestTime: Math.round(this.result.poolish?.coldRestTime ?? 0),
    },
    items: [
      { icon: this.WandIcon, helperDescriptions: 2 },
      { icon: this.WheatIcon, helperDescriptions: 1 },
      { icon: this.ThermometerSunIcon, helperDescriptions: 1 },
      { icon: this.ThermometerSnowflakeIcon, helperDescriptions: 1 },
    ],
  };
}
