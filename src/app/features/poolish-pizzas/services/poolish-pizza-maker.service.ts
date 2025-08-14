import { Injectable } from '@angular/core';
import {
  BASE_HONEY_AMOUNT,
  HONEY_RATIO,
  PIZZA_WEIGHT,
  POOLISH_RATIO_BY_TEMPERATURE,
} from '../constants';
import { SALT_WEIGHT_PER_PIZZA } from '../constants';
import { YeastType } from '../enums/yeast-type.enum';
import { FRESH_YEAST_AMOUNT } from '../constants';
import { DRY_YEAST_AMOUNT } from '../constants';
import { PoolishPizzaFormData } from '../poolish-pizzas-form/poolish-pizzas-form.component';

export interface PoolishPizzaResult {
  totalFlour: number;
  totalWater: number;
  poolishFlour: number;
  poolishWater: number;
  poolishYeast: number;
  poolishHoney: number;
  flourToAdd: number;
  waterToAdd: number;
  saltWeight: number;
}

@Injectable({
  providedIn: 'root',
})
export class PoolishPizzaMakerService {
  compute(data: PoolishPizzaFormData): PoolishPizzaResult {
    const isDryYeast = data.yeastType === YeastType.DRY;
    const yeastAmount = isDryYeast ? DRY_YEAST_AMOUNT : FRESH_YEAST_AMOUNT;
    const saltWeight = SALT_WEIGHT_PER_PIZZA * data.nbPizzas;

    const poolishRatio =
      data.poolishRatio > 0
        ? data.poolishRatio
        : POOLISH_RATIO_BY_TEMPERATURE[data.temperature];

    const flourPerPizza = PIZZA_WEIGHT / (1 + data.hydrationRatio);
    const waterPerPizza = PIZZA_WEIGHT - flourPerPizza;
    const totalFlour = Math.round(data.nbPizzas * flourPerPizza);
    const totalWater = Math.round(data.nbPizzas * waterPerPizza);
    const poolishFlour =
      Math.round(poolishRatio * (totalFlour + totalWater)) / 2;
    const poolishWater = poolishFlour;

    const poolishYeast =
      Math.round(
        Math.min(
          10,
          Math.max(yeastAmount, totalFlour / (isDryYeast ? 1000 : 333)),
        ) * 100,
      ) / 100;

    const poolishHoney = Math.round(
      Math.max(
        BASE_HONEY_AMOUNT,
        BASE_HONEY_AMOUNT + (data.nbPizzas - 60) * HONEY_RATIO,
      ),
    );
    const flourToAdd = totalFlour - poolishFlour;
    const waterToAdd = totalWater - poolishWater;

    const result = {
      totalFlour,
      totalWater,
      poolishFlour,
      poolishWater,
      poolishYeast,
      poolishHoney,
      flourToAdd,
      waterToAdd,
      saltWeight,
    };

    return result;
  }
}
