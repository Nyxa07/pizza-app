import { inject, Injectable } from '@angular/core';
import {
  BASE_HONEY_AMOUNT,
  HONEY_RATIO,
  PIZZA_WEIGHT,
  SALT_RATIO,
} from '../constants';
import { PoolishPizzaFormData } from '../dough-form/dough-form.component';
import { YeastService } from 'src/app/features/dough/services/yeast.service';
import { DoughType } from '../enums/dough-type.enum';

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
  private yeastService = inject(YeastService);

  // Compute the flour (and water) weight used in the poolish.
  // Definition: `ratio` is the fraction of TOTAL FLOUR that will go into the poolish.
  // Water in the poolish equals that flour weight (100 % hydration).
  private computePoolishQuantity(ratio: number, totalFlourAndWater: number) {
    return ratio * totalFlourAndWater; // no rounding here
  }

  private round(value: number) {
    return Math.round(value); // 1 g precision for bulk ingredients
  }

  private roundYeast(value: number) {
    return Math.round(value * 100) / 100; // 0.01 g precision for yeast
  }

  compute(data: PoolishPizzaFormData): DoughResult {
    // Clamp user inputs to safe range
    const hydration = Math.max(0, Math.min(data.hydrationRatio, 1));
    const poolishRatio = Math.max(0, Math.min(data.poolishRatio ?? 0, 0.6));

    // Ingredients
    const flourPerPizza = PIZZA_WEIGHT / (1 + hydration);
    const waterPerPizza = PIZZA_WEIGHT - flourPerPizza;
    const totalFlour = data.nbPizzas * flourPerPizza;
    const totalWater = data.nbPizzas * waterPerPizza;
    const poolishTotal = this.computePoolishQuantity(
      poolishRatio,
      totalFlour + totalWater,
    );
    const poolishQuantity = poolishTotal / 2;

    // Salt: baker's percentage
    const salt = SALT_RATIO * totalFlour;
    const flourPerDough = totalFlour - poolishQuantity;
    const waterPerDough = totalWater - poolishQuantity;
    const honey = Math.max(
      BASE_HONEY_AMOUNT,
      BASE_HONEY_AMOUNT + (data.nbPizzas - 60) * HONEY_RATIO,
    );

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

    const yeastRounded = this.roundYeast(yeast);

    const result: DoughResult = {
      total: {
        flour: this.round(totalFlour),
        water: this.round(totalWater),
        yeast: yeastRounded,
        salt: this.round(salt),
        coldRestTime: data.coldRestTime,
        rtRestTime: data.rtRestTime,
        honey: this.round(honey),
      },

      poolish:
        data.doughType === DoughType.POOLISH
          ? {
              flour: this.round(poolishQuantity),
              water: this.round(poolishQuantity),
              yeast: yeastRounded,
              salt: 0,
              coldRestTime: data.coldRestTime,
              rtRestTime: data.rtRestTime,
              honey: this.round(honey),
            }
          : null,

      dough: {
        yeast: data.doughType === DoughType.POOLISH ? 0 : yeastRounded,
        flour: this.round(flourPerDough),
        water: this.round(waterPerDough),
        salt: this.round(salt),
        coldRestTime: data.coldRestTime,
        rtRestTime: data.rtRestTime,
        honey: this.round(honey),
      },
      pizzaBallWeight: PIZZA_WEIGHT,
    };

    return result;
  }
}
