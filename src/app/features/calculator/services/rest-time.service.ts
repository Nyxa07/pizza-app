import { Injectable } from '@angular/core';
import { CalculatorConfigService } from './calculator-config.service';

@Injectable({
  providedIn: 'root',
})
export class RestTimeService {
  constructor(private calculatorConfigService: CalculatorConfigService) {}

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
