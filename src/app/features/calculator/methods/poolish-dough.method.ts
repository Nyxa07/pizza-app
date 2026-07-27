import {
  ArrowDownUpIcon,
  BubblesIcon,
  CircleIcon,
  CookingPotIcon,
  EclipseIcon,
  FlameIcon,
  HandIcon,
  ThermometerSunIcon,
  UndoDotIcon,
  WheatIcon,
} from 'lucide-angular';

import {
  IMethodDef,
  IMethodDefStep,
} from 'src/app/features/method/interfaces/method-def.interface';

import { ICalculatorOutput } from '../interfaces/calculator-output.interface';
import { DOUGH_BASE_TIME } from '../dough.constants';

const STEPS_KEY = 'calculator.method.steps.';

/**
 * The dough part of a poolish method: the frasage lands on the engine's
 * poolish.prepTime, balls one DOUGH_BASE_TIME later, bake at total time.
 */
export class PoolishDoughMethod implements IMethodDef {
  constructor(private result: ICalculatorOutput) {}

  private get quantity() {
    return this.result.dough;
  }

  title = 'calculator.method.titles.poolishDough';

  quantities = this.quantity;

  variables = {
    rtRestTime: Math.round(this.quantity.rtRestTime),
    coldRestTime: Math.round(this.quantity.coldRestTime),
    pizzaWeight: Math.round(this.result.pizzaBalls.weight),
  };

  steps: IMethodDefStep[] = [
    {
      icon: CookingPotIcon,
      helperDescriptions: 1,
      hide: !this.result.poolish.coldRestTime,
      baseTranslationKey: STEPS_KEY + 'takeOutPoolish',
      atHours: this.result.poolish.prepTime - 1,
    },
    {
      icon: BubblesIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'addWaterSalt',
      variables: {
        hasSalt: this.quantity.salt > 0,
        hasOliveOil: this.quantity.oliveOil > 0,
      },
      atHours: this.result.poolish.prepTime,
      ingredients: {
        water: this.quantity.water,
        salt: this.quantity.salt,
        oliveOil: this.quantity.oliveOil,
      },
    },
    {
      icon: WheatIcon,
      helperDescriptions: 1,
      baseTranslationKey: STEPS_KEY + 'addFlourPoolishDough',
      ingredients: { flour: this.quantity.flour },
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
      icon: UndoDotIcon,
      helperDescriptions: 4,
      baseTranslationKey: STEPS_KEY + 'foldAndShape',
    },
    {
      icon: ThermometerSunIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'shortRestPoolishDough',
    },
    {
      icon: CircleIcon,
      helperDescriptions: 2,
      baseTranslationKey: STEPS_KEY + 'shapeAsBall',
    },
    {
      icon: ThermometerSunIcon,
      helperDescriptions: 0,
      baseTranslationKey: STEPS_KEY + 'restOneHour',
    },
    {
      icon: EclipseIcon,
      helperDescriptions: 5,
      baseTranslationKey: STEPS_KEY + 'formBalls',
      atHours: this.result.poolish.prepTime + DOUGH_BASE_TIME,
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
