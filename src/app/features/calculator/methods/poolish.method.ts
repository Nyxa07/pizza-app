import {
  ThermometerSnowflakeIcon,
  ThermometerSunIcon,
  WandIcon,
  WheatIcon,
} from 'lucide-angular';

import {
  IMethodDef,
  IMethodDefStep,
} from 'src/app/features/method/interfaces/method-def.interface';

import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { DOUGH_BASE_TIME } from '../services/processors/timings.processor';

const STEPS_KEY = 'calculator.method.steps.';

/** The poolish part of the Dough method: mixed at the start, then rested. */
export class PoolishMethod implements IMethodDef {
  constructor(private result: ICalculatorOutput) {}

  private get quantity() {
    return this.result.poolish;
  }

  title = 'calculator.method.titles.poolish';

  quantities = this.quantity;

  variables = {
    rtRestTime: Math.round(this.quantity.rtRestTime),
    coldRestTime: Math.round(this.quantity.coldRestTime),
  };

  steps: IMethodDefStep[] = [
    {
      icon: WandIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'mixIngredients',
      variables: {
        hasHoney: this.quantity.honey > 0,
      },
      atHours: 0,
      ingredients: {
        water: this.quantity.water,
        yeast: this.quantity.yeast,
        honey: this.quantity.honey,
      },
    },
    {
      icon: WheatIcon,
      helperDescriptions: 1,
      baseTranslationKey: STEPS_KEY + 'addFlourPoolish',
      ingredients: { flour: this.quantity.flour },
    },
    {
      icon: ThermometerSunIcon,
      helperDescriptions: 1,
      baseTranslationKey: STEPS_KEY + 'restRT',
    },
    {
      icon: ThermometerSnowflakeIcon,
      helperDescriptions: 1,
      hide: !this.quantity.coldRestTime,
      baseTranslationKey: STEPS_KEY + 'restCold',
      atHours: DOUGH_BASE_TIME + this.quantity.rtRestTime,
    },
  ];
}
