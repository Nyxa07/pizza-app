import { Injectable } from '@angular/core';
import { YeastService } from 'src/app/features/calculator/services/yeast.service';
import { DoughType } from '../enums/dough-type.enum';
import { CalculatorInput } from './calculator-state.service';
import { RestTimeService } from './rest-time.service';
import { HydrationService } from './hydration.service';

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
    private yeastService: YeastService,
    private restTimeService: RestTimeService,
    private hydrationService: HydrationService,
  ) {}

  // Compute the flour (and water) weight used in the poolish.
  // Definition: `ratio` is the fraction of TOTAL FLOUR that will go into the poolish.
  // Water in the poolish equals that flour weight (100 % hydration).
  private computePoolishQuantity(ratio: number, totalFlourAndWater: number) {
    return ratio * totalFlourAndWater; // no rounding here
  }

  compute(data: CalculatorInput): DoughResult {
    // Clamp user inputs to safe range
    const hydration = Math.max(
      0,
      Math.min(
        data.hydrationRatio ??
          this.hydrationService.compute(data.flourStrength).minHydration,
        1,
      ),
    );
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

    const pizzaBallsRestTime = this.restTimeService.computePizzaBallsRestTime(
      data.temperature,
    );

    const yeast =
      data.doughType === DoughType.POOLISH
        ? this.yeastService.yeastForPoolish(
            data.temperature,
            data.yeastType,
            poolishQuantity,
            data.rtRestTime ?? 0,
            data.coldRestTime ?? 0,
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
            data.rtRestTime ?? 0,
            data.coldRestTime ?? 0,
            data.flourStrength,
          );

    const result: DoughResult = {
      total: {
        flour: totalFlour,
        water: totalWater,
        yeast,
        salt: salt,
        coldRestTime: data.coldRestTime ?? 0,
        rtRestTime: data.rtRestTime ?? 0,
        honey: honey,
      },

      poolish: hasPoolish
        ? {
            flour: poolishQuantity,
            water: poolishQuantity,
            yeast,
            salt: 0,
            coldRestTime: data.coldRestTime ?? 0,
            rtRestTime: data.rtRestTime ?? 0,
            honey: honey,
          }
        : null,

      dough: {
        yeast: hasPoolish ? 0 : yeast,
        flour: flourPerDough,
        water: waterPerDough,
        salt: salt,
        coldRestTime: data.coldRestTime ?? 0,
        rtRestTime: data.rtRestTime ?? 0,
        honey: honey,
      },
      pizzaBalls: {
        rtRestTime: pizzaBallsRestTime,
      },
      pizzaWeight: data.pizzaWeight,
    };

    return result;
  }
}
