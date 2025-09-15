import { Injectable } from '@angular/core';
import { IProcessor } from '../../interfaces/processor.interface';
import { DoughType } from '../../enums/dough-type.enum';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';

interface FlourWaterQuantityProcessorPrevAcc {
  hydrationRatio: number;
  pizzaBalls: { weight: number };
}

@Injectable({
  providedIn: 'root',
})
export class FlourWaterQuantityProcessor implements IProcessor {
  process(input: ICalculatorInput, acc: FlourWaterQuantityProcessorPrevAcc) {
    const hydrationRatio = acc.hydrationRatio;
    const flourPerPizza = acc.pizzaBalls.weight / (1 + hydrationRatio);
    const waterPerPizza = acc.pizzaBalls.weight - flourPerPizza;
    const totalFlour = input.nbPizzas * flourPerPizza;
    const totalWater = input.nbPizzas * waterPerPizza;
    const poolishTotal = this.computePoolishQuantity(
      input.doughType,
      input.poolishRatio,
      input.nbPizzas,
      acc.pizzaBalls.weight,
    );
    const poolishQuantity = poolishTotal / 2;
    const flourPerDough = totalFlour - poolishQuantity;
    const waterPerDough = totalWater - poolishQuantity;

    return {
      total: {
        flour: totalFlour,
        water: totalWater,
      },
      poolish: {
        flour: poolishQuantity,
        water: poolishQuantity,
      },
      dough: {
        flour: flourPerDough,
        water: waterPerDough,
      },
    };
  }

  private computePoolishQuantity(
    doughType: DoughType,
    poolishRatio: number | null,
    nbPizzas: number,
    pizzaWeight: number,
  ) {
    const hasPoolish = doughType === DoughType.POOLISH;
    const ratio = hasPoolish ? (poolishRatio ?? 0.3) : 0;
    const totalFlourAndWater = nbPizzas * pizzaWeight;
    return ratio * totalFlourAndWater;
  }
}
