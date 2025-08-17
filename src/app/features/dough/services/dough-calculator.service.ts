import { inject, Injectable } from '@angular/core';
import { YeastService } from 'src/app/features/dough/services/yeast.service';
import { DoughType } from '../enums/dough-type.enum';
import { DoughInput } from './dough-form-state.service';
import { DoughConfigService } from './dough-config.service';

interface Quantity {
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
  pizzaBallWeight: number;
}

@Injectable({
  providedIn: 'root',
})
export class DoughCalculatorService {
  constructor(
    private doughConfigService: DoughConfigService,
    private yeastService: YeastService,
  ) {}

  // Compute the flour (and water) weight used in the poolish.
  // Definition: `ratio` is the fraction of TOTAL FLOUR that will go into the poolish.
  // Water in the poolish equals that flour weight (100 % hydration).
  private computePoolishQuantity(ratio: number, totalFlourAndWater: number) {
    return ratio * totalFlourAndWater; // no rounding here
  }

  compute(data: DoughInput): DoughResult {
    // Clamp user inputs to safe range
    const hydration = Math.max(0, Math.min(data.hydrationRatio, 1));
    const hasPoolish = data.doughType === DoughType.POOLISH;
    const poolishRatio = hasPoolish
      ? Math.max(0, Math.min(data.poolishRatio ?? 0, 0.6))
      : 0;

    // Ingredients
    const flourPerPizza =
      this.doughConfigService.constants.pizzaWeight / (1 + hydration);
    const waterPerPizza =
      this.doughConfigService.constants.pizzaWeight - flourPerPizza;
    const totalFlour = data.nbPizzas * flourPerPizza;
    const totalWater = data.nbPizzas * waterPerPizza;
    const poolishTotal = this.computePoolishQuantity(
      poolishRatio,
      totalFlour + totalWater,
    );
    const poolishQuantity = poolishTotal / 2;

    // Salt: baker's percentage
    const salt = this.doughConfigService.constants.saltRatio * totalFlour;
    const flourPerDough = totalFlour - poolishQuantity;
    const waterPerDough = totalWater - poolishQuantity;
    const honey = this.doughConfigService.constants.honeyRatio * totalFlour;

    const yeast =
      data.doughType === DoughType.POOLISH
        ? this.yeastService.yeastForPoolish(
            data.temperature,
            data.yeastType,
            poolishQuantity,
            data.rtRestTime,
            data.coldRestTime,
            honey,
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
      pizzaBallWeight: this.doughConfigService.constants.pizzaWeight,
    };

    return result;
  }
}
