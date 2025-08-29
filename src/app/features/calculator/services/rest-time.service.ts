import { Injectable } from '@angular/core';
import { DoughType } from '../enums/dough-type.enum';
import { CalculatorInput } from './calculator-state.service';
import { CalculatorConfigService } from './calculator-config.service';

@Injectable({
  providedIn: 'root',
})
export class RestTimeService {
  constructor(private calculatorConfigService: CalculatorConfigService) {}

  compute(input: CalculatorInput): {
    rtRestTime: number;
    coldRestTime: number;
  } {
    const preparationDate = new Date(input.preparationDate ?? '');
    const cookingDate = new Date(input.cookingDate ?? '');
    const doughType = input.doughType;

    const pizzaBallsRestTime = this.computePizzaBallsRestTime(
      input.temperature,
    );
    let paddingPoolish = 4 * 3600 + pizzaBallsRestTime * 3600;
    let paddingDirect = 3600 + pizzaBallsRestTime * 3600;
    const timeUntilCooking =
      (cookingDate.getTime() - preparationDate.getTime()) / 1000;
    let rtRestTime =
      doughType === DoughType.POOLISH
        ? 3600
        : Math.min(timeUntilCooking, 24 * 3600);

    let coldRestTime = timeUntilCooking - rtRestTime - 3600;

    if (doughType === DoughType.POOLISH) {
      coldRestTime -= paddingPoolish;
    } else {
      if (coldRestTime > paddingDirect) {
        coldRestTime -= paddingDirect;
        paddingDirect = 0;
      } else {
        paddingDirect -= coldRestTime;
        coldRestTime = 0;
      }
      rtRestTime -= paddingDirect;
    }

    return {
      rtRestTime: Math.round(rtRestTime / 3600),
      coldRestTime: Math.round(coldRestTime / 3600),
    };
  }

  computePizzaBallsRestTime(temperature: number): number {
    // Inverse relationship: 3 hours at 19°C, 1 hour at 25°C
    const minTemp =
      this.calculatorConfigService.constants.pizzaBallsRestTime.minTemperature;
    const maxTemp =
      this.calculatorConfigService.constants.pizzaBallsRestTime.maxTemperature;
    const minHours =
      this.calculatorConfigService.constants.pizzaBallsRestTime.minRestTime;
    const maxHours =
      this.calculatorConfigService.constants.pizzaBallsRestTime.maxRestTime;

    // Clamp temperature to the range [19, 25]
    const clampedTemperature = Math.max(
      minTemp,
      Math.min(temperature, maxTemp),
    );

    // Inverse linear interpolation: higher temp = lower rest time
    // At minTemp (19°C) we want maxHours (3h), at maxTemp (25°C) we want minHours (1h)
    const slope = (minHours - maxHours) / (maxTemp - minTemp);
    const restTime = maxHours + slope * (clampedTemperature - minTemp);

    return restTime;
  }
}
