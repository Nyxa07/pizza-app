import { inject, Injectable } from '@angular/core';
import {
  BASE_HONEY_AMOUNT,
  HONEY_RATIO,
  POOLISH_RATIO_BY_TEMPERATURE,
} from '../constants';
import { PoolishPizzaFormData } from '../dough-form/dough-form.component';
import { YeastService } from 'src/app/features/dough/services/yeast.service';
import { PIZZA_WEIGHT, SALT_WEIGHT_PER_PIZZA } from 'src/app/shared/constants';

export interface PoolishPizzaResult {
  totalFlour: number;
  totalWater: number;
  totalYeast: number;
  totalHoney: number;
  poolishFlour: number;
  poolishWater: number;
  poolishYeast: number;
  poolishHoney: number;
  flourToAdd: number;
  waterToAdd: number;
  saltWeight: number;
  coldRestTime: number;
  rtRestTime: number;
}

@Injectable({
  providedIn: 'root',
})
export class PoolishPizzaMakerService {
  private yeastService = inject(YeastService);

  compute(data: PoolishPizzaFormData): PoolishPizzaResult {
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

    const poolishYeast = this.yeastService.yeastQuantity(
      data.temperature,
      data.yeastType,
      poolishFlour,
      data.rtRestTime,
      data.coldRestTime,
    );

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
      totalYeast: poolishYeast,
      totalHoney: poolishHoney,
      poolishFlour,
      poolishWater,
      poolishYeast,
      poolishHoney,
      flourToAdd,
      waterToAdd,
      saltWeight,
      coldRestTime: data.coldRestTime,
      rtRestTime: data.rtRestTime,
    };

    return result;
  }
}
