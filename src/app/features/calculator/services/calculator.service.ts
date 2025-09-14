import { Injectable } from '@angular/core';
import { YeastService } from 'src/app/features/calculator/services/yeast.service';
import { DoughType } from '../enums/dough-type.enum';
import { CalculatorInput } from './calculator-state.service';
import { HydrationService } from './hydration.service';
import { PlannerService, TimingPart, Timings } from './planner.service';
import { PizzaType } from '../../settings/enums/pizza-type.enum';

export interface Quantity extends TimingPart {
  yeast: number;
  flour: number;
  water: number;
  salt: number;
  honey: number;
  oliveOil: number;
}

export interface DoughResult {
  total: Quantity;
  poolish: Quantity | null;
  dough: Quantity;
  pizzaWeight: number;
  pizzaBalls: TimingPart;
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  constructor(
    private yeastService: YeastService,
    private hydrationService: HydrationService,
    private plannerService: PlannerService,
  ) {}

  // Compute the flour (and water) weight used in the poolish.
  // Definition: `ratio` is the fraction of TOTAL FLOUR that will go into the poolish.
  // Water in the poolish equals that flour weight (100 % hydration).
  private computePoolishQuantity(
    doughType: DoughType,
    poolishRatio: number,
    nbPizzas: number,
    pizzaWeight: number,
  ) {
    const hasPoolish = doughType === DoughType.POOLISH;
    const ratio = hasPoolish ? (poolishRatio ?? 0.3) : 0;
    const totalFlourAndWater = nbPizzas * pizzaWeight;
    return ratio * totalFlourAndWater; // no rounding here
  }

  private computeTimings(data: CalculatorInput): Timings {
    return this.plannerService.computeTimingsFromRestTimes({
      rtRestTime: data.rtRestTime ?? 0,
      coldRestTime: data.coldRestTime ?? 0,
      method: data.doughType,
      temperature: data.temperature,
    });
  }

  private computeHydration(data: CalculatorInput): number {
    return (
      data.hydrationRatio ??
      this.hydrationService.compute(data.flourStrength, data.pizzaType)
        .minHydration
    );
  }

  private computeOliveOil(
    totalFlour: number,
    oliveOilRatio: number,
    pizzaType: PizzaType,
  ): number {
    return pizzaType === PizzaType.NEAPOLITAN ? 0 : oliveOilRatio * totalFlour;
  }

  compute(data: CalculatorInput): DoughResult {
    const hydration = this.computeHydration(data);
    const hasPoolish = data.doughType === DoughType.POOLISH;

    // Flour and water
    const flourPerPizza = data.pizzaWeight / (1 + hydration);
    const waterPerPizza = data.pizzaWeight - flourPerPizza;
    const totalFlour = data.nbPizzas * flourPerPizza;
    const totalWater = data.nbPizzas * waterPerPizza;
    const poolishTotal = this.computePoolishQuantity(
      data.doughType,
      data.poolishRatio ?? 0.3,
      data.nbPizzas,
      data.pizzaWeight,
    );
    const poolishQuantity = poolishTotal / 2;

    // Ingredients ratios
    const salt = data.saltRatio * totalFlour;
    const flourPerDough = totalFlour - poolishQuantity;
    const waterPerDough = totalWater - poolishQuantity;
    const honey = data.honeyRatio * totalFlour;
    const oliveOil = this.computeOliveOil(
      totalFlour,
      data.oliveOilRatio,
      data.pizzaType,
    );

    const timings = this.computeTimings(data);

    const yeast =
      data.doughType === DoughType.POOLISH
        ? this.yeastService.yeastForPoolish(
            data.temperature,
            data.yeastType,
            poolishQuantity,
            timings.poolish.rtRestTime,
            timings.poolish.coldRestTime,
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
            timings.dough.rtRestTime,
            timings.dough.coldRestTime,
            data.flourStrength,
          );

    const result: DoughResult = {
      total: {
        flour: totalFlour,
        water: totalWater,
        yeast,
        salt: salt,
        coldRestTime: timings.total.coldRestTime,
        rtRestTime: timings.total.rtRestTime,
        honey: honey,
        oliveOil: oliveOil,
        prepTime: timings.total.prepTime,
      },

      poolish: hasPoolish
        ? {
            flour: poolishQuantity,
            water: poolishQuantity,
            yeast,
            salt: 0,
            coldRestTime: timings.poolish.coldRestTime,
            rtRestTime: timings.poolish.rtRestTime,
            honey: honey,
            oliveOil: 0,
            prepTime: timings.poolish.prepTime,
          }
        : null,

      dough: {
        yeast: hasPoolish ? 0 : yeast,
        flour: flourPerDough,
        water: waterPerDough,
        salt: salt,
        coldRestTime: timings.dough.coldRestTime,
        rtRestTime: timings.dough.rtRestTime,
        honey: honey,
        oliveOil: oliveOil,
        prepTime: timings.dough.prepTime,
      },
      pizzaBalls: {
        rtRestTime: timings.pizzaBalls.rtRestTime,
        prepTime: timings.pizzaBalls.prepTime,
        coldRestTime: timings.pizzaBalls.coldRestTime,
      },
      pizzaWeight: data.pizzaWeight,
    };

    return result;
  }
}
