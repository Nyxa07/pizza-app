import { Injectable } from '@angular/core';
import { YeastService } from 'src/app/features/calculator/services/yeast.service';
import { DoughType } from '../enums/dough-type.enum';
import { CalculatorInput } from './calculator-state.service';
import { CalculatorConfigService } from './calculator-config.service';
import { DEFAULT_DOUGH_CONSTANTS } from '../dough.constants';

export interface Quantity {
  yeast: number;
  flour: number;
  water: number;
  salt: number;
  coldRestTime: number;
  rtRestTime: number;
  honey: number;
}

export interface DoughResult {
  total: Quantity;
  poolish: Quantity | null;
  dough: Quantity;
  pizzaBalls: { rtRestTime: number };
  pizzaWeight: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  constructor(
    private calculatorConfigService: CalculatorConfigService,
    private yeastService: YeastService,
  ) {}

  // Compute the flour (and water) weight used in the poolish.
  // Definition: `ratio` is the fraction of TOTAL FLOUR that will go into the poolish.
  // Water in the poolish equals that flour weight (100 % hydration).
  private computePoolishQuantity(ratio: number, totalFlourAndWater: number) {
    return ratio * totalFlourAndWater; // no rounding here
  }

  private computePizzaBallsRestTime(data: CalculatorInput): number {
    // Linear interpolation between 1 hour at 19°C and 3 hours at 25°C
    const minTemp = DEFAULT_DOUGH_CONSTANTS.pizzaBallsRestTime.minTemperature;
    const maxTemp = DEFAULT_DOUGH_CONSTANTS.pizzaBallsRestTime.maxTemperature;
    const minHours = DEFAULT_DOUGH_CONSTANTS.pizzaBallsRestTime.minRestTime;
    const maxHours = DEFAULT_DOUGH_CONSTANTS.pizzaBallsRestTime.maxRestTime;

    // Clamp temperature to the range [19, 25]
    const temperature = Math.max(minTemp, Math.min(data.temperature, maxTemp));

    // Linear interpolation: y = mx + b
    const slope = (maxHours - minHours) / (maxTemp - minTemp);
    const restTime = minHours + slope * (temperature - minTemp);

    return restTime;
  }

  compute(data: CalculatorInput): DoughResult {
    // Clamp user inputs to safe range
    const hydration = Math.max(0, Math.min(data.hydrationRatio, 1));
    const hasPoolish = data.doughType === DoughType.POOLISH;
    const poolishRatio = hasPoolish
      ? Math.max(0, Math.min(data.poolishRatio ?? 0, 0.6))
      : 0;

    // Ingredients
    const flourPerPizza = data.pizzaWeight / (1 + hydration);
    const waterPerPizza = data.pizzaWeight - flourPerPizza;
    const totalFlour = data.nbPizzas * flourPerPizza;
    const totalWater = data.nbPizzas * waterPerPizza;
    const poolishTotal = this.computePoolishQuantity(
      poolishRatio,
      totalFlour + totalWater,
    );
    const poolishQuantity = poolishTotal / 2;

    // Salt: baker's percentage
    const salt = data.saltRatio * totalFlour;
    const flourPerDough = totalFlour - poolishQuantity;
    const waterPerDough = totalWater - poolishQuantity;
    const honey = data.honeyRatio * totalFlour;

    const yeast =
      data.doughType === DoughType.POOLISH
        ? this.yeastService.yeastForPoolish(
            data.temperature,
            data.yeastType,
            poolishQuantity,
            data.rtRestTime,
            data.coldRestTime,
            honey,
            data.flourStrength,
          )
        : this.yeastService.yeastForDough(
            data.temperature,
            data.yeastType,
            flourPerDough,
            hydration,
            honey,
            salt,
            data.rtRestTime,
            data.coldRestTime,
            data.flourStrength,
          );

    const yeastValue = yeast;

    const result: DoughResult = {
      total: {
        flour: totalFlour,
        water: totalWater,
        yeast: yeastValue,
        salt: salt,
        coldRestTime: data.coldRestTime,
        rtRestTime: data.rtRestTime,
        honey: honey,
      },

      poolish: hasPoolish
        ? {
            flour: poolishQuantity,
            water: poolishQuantity,
            yeast: yeastValue,
            salt: 0,
            coldRestTime: data.coldRestTime,
            rtRestTime: data.rtRestTime,
            honey: honey,
          }
        : null,

      dough: {
        yeast: hasPoolish ? 0 : yeastValue,
        flour: flourPerDough,
        water: waterPerDough,
        salt: salt,
        coldRestTime: data.coldRestTime,
        rtRestTime: data.rtRestTime,
        honey: honey,
      },
      pizzaBalls: {
        rtRestTime: this.computePizzaBallsRestTime(data),
      },
      pizzaWeight: data.pizzaWeight,
    };

    return result;
  }
}
