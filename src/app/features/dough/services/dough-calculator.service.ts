import { inject, Injectable } from '@angular/core';
import {
  BASE_HONEY_AMOUNT,
  HONEY_RATIO,
  PIZZA_WEIGHT,
  SALT_WEIGHT_PER_PIZZA,
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
  poolish: Quantity;
  dough: Quantity;
}

@Injectable({
  providedIn: 'root',
})
export class DoughCalculatorService {
  private yeastService = inject(YeastService);

  private computePoolishQuantity(
    ratio: number,
    totalFlour: number,
    totalWater: number,
  ) {
    return this.round((ratio * (totalFlour + totalWater)) / 2);
  }

  private round(value: number) {
    return Math.round(value * 10) / 10;
  }

  compute(data: PoolishPizzaFormData): DoughResult {
    const salt = SALT_WEIGHT_PER_PIZZA * data.nbPizzas;
    const flourPerPizza = PIZZA_WEIGHT / (1 + data.hydrationRatio);
    const waterPerPizza = PIZZA_WEIGHT - flourPerPizza;
    const totalFlour = this.round(data.nbPizzas * flourPerPizza);
    const totalWater = this.round(data.nbPizzas * waterPerPizza);
    const poolishQuantity = this.computePoolishQuantity(
      data.poolishRatio ?? 0,
      totalFlour,
      totalWater,
    );

    const doughFlour = this.round(totalFlour - poolishQuantity);
    const doughWater = this.round(totalWater - poolishQuantity);
    const honey = this.round(
      Math.max(
        BASE_HONEY_AMOUNT,
        BASE_HONEY_AMOUNT + (data.nbPizzas - 60) * HONEY_RATIO,
      ),
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
            doughFlour,
            data.hydrationRatio,
            honey,
            salt,
            data.rtRestTime,
            data.coldRestTime,
          );

    return {
      total: {
        flour: totalFlour,
        water: totalWater,
        yeast: yeast,
        salt,
        coldRestTime: data.coldRestTime,
        rtRestTime: data.rtRestTime,
        honey: honey,
      },
      poolish: {
        flour: poolishQuantity,
        water: poolishQuantity,
        yeast: yeast,
        salt: 0,
        coldRestTime: data.coldRestTime,
        rtRestTime: data.rtRestTime,
        honey: honey,
      },
      dough: {
        yeast: data.doughType === DoughType.POOLISH ? 0 : yeast,
        flour: doughFlour,
        water: doughWater,
        salt,
        coldRestTime: data.coldRestTime,
        rtRestTime: data.rtRestTime,
        honey,
      },
    };
  }
}
