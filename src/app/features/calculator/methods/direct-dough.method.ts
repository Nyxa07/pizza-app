import {
  ArrowDownUpIcon,
  CircleIcon,
  CookingPotIcon,
  EclipseIcon,
  FlameIcon,
  HandIcon,
  ThermometerSnowflakeIcon,
  ThermometerSunIcon,
  UndoDotIcon,
  WandIcon,
  WheatIcon,
} from 'lucide-angular';

import {
  IMethodDef,
  IMethodDefStep,
} from 'src/app/features/method/interfaces/method-def.interface';

import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { DOUGH_BASE_TIME } from '../dough.constants';

const STEPS_KEY = 'calculator.method.steps.';

/** The single-part direct Dough method, from the mix to the bake. */
export class DirectDoughMethod implements IMethodDef {
  constructor(private result: ICalculatorOutput) {}

  private get quantity() {
    return this.result.dough;
  }

  title = 'calculator.method.titles.directDough';

  quantities = this.quantity;

  variables = {
    rtRestTime: Math.round(this.quantity.rtRestTime),
    coldRestTime: Math.round(this.quantity.coldRestTime),
    pizzaWeight: Math.round(this.result.pizzaBalls.weight),
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
      baseTranslationKey: STEPS_KEY + 'addFlourSaltOil',
      variables: {
        hasOliveOil: this.quantity.oliveOil > 0,
      },
      ingredients: {
        flour: this.quantity.flour,
        salt: this.quantity.salt,
        oliveOil: this.quantity.oliveOil,
      },
    },
    {
      icon: ArrowDownUpIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'transferDough',
    },
    {
      icon: HandIcon,
      helperDescriptions: 3,
      baseTranslationKey: STEPS_KEY + 'knead',
    },
    {
      icon: CircleIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'shapeAsBall',
    },
    {
      icon: ThermometerSunIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'shortRestDirectDough',
    },
    {
      icon: UndoDotIcon,
      helperDescriptions: 4,
      baseTranslationKey: STEPS_KEY + 'foldAndShape',
    },
    {
      icon: ThermometerSunIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'restRT',
    },
    {
      icon: ThermometerSnowflakeIcon,
      helperDescriptions: 3,
      hide: !this.quantity.coldRestTime,
      baseTranslationKey: STEPS_KEY + 'restCold',
      atHours: DOUGH_BASE_TIME + this.quantity.rtRestTime,
    },
    {
      icon: CookingPotIcon,
      helperDescriptions: 1,
      hide: !this.quantity.coldRestTime,
      baseTranslationKey: STEPS_KEY + 'takeOutDough',
      atHours:
        DOUGH_BASE_TIME + this.quantity.rtRestTime + this.quantity.coldRestTime,
    },
    {
      icon: EclipseIcon,
      helperDescriptions: 5,
      baseTranslationKey: STEPS_KEY + 'formBalls',
      atHours: this.quantity.prepTime,
    },
    {
      icon: ThermometerSunIcon,
      helperDescriptions: 2,
      variables: {
        rtRestTime: Math.round(this.result.pizzaBalls.rtRestTime),
      },
      baseTranslationKey: STEPS_KEY + 'finalRest',
      hide: !Math.round(this.result.pizzaBalls.rtRestTime),
    },
    {
      icon: FlameIcon,
      helperDescriptions: 1,
      baseTranslationKey: STEPS_KEY + 'bake',
      atHours: this.result.total.prepTime,
    },
  ];
}
