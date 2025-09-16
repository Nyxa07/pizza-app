import { Injectable } from '@angular/core';
import { CalculatorConfigService } from '../calculator-config.service';
import {
  IProcessor,
  PartialCalculatorOutput,
} from '../../interfaces/processor.interface';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';

@Injectable({
  providedIn: 'root',
})
export class PizzaBallsRestTimeProcessor implements IProcessor {
  constructor(private calculatorConfigService: CalculatorConfigService) {}

  process(input: ICalculatorInput, acc?: PartialCalculatorOutput) {
    const constants = this.calculatorConfigService.constants.pizzaBallsRestTime;
    const coefMinTime = constants.minRestTimeCoef;
    const coefMaxTime = constants.maxRestTimeCoef;
    const maxTotalRestTime = constants.maxTotalRestTime;

    // Inverse relationship: 3 hours at 19°C, 1 hour at 25°C
    const minTemp = constants.minTemperature;
    const maxTemp = constants.maxTemperature;

    const totalRestTime = Math.min(
      Math.max(
        (input.rtRestTime ?? 0) + (input.coldRestTime ?? 0),
        input.globalRestTime ?? 0,
      ),
      maxTotalRestTime,
    );

    const minRestTime = totalRestTime * coefMinTime;
    const maxRestTime = totalRestTime * coefMaxTime;

    // Clamp temperature to the range [19, 25]
    const clampedTemperature = Math.max(
      minTemp,
      Math.min(input.temperature, maxTemp),
    );

    // Inverse linear interpolation: higher temp = lower rest time
    // At minTemp (19°C) we want maxHours (3h), at maxTemp (25°C) we want minHours (1h)
    const slope = (minRestTime - maxRestTime) / (maxTemp - minTemp);
    const restTime = maxRestTime + slope * (clampedTemperature - minTemp);

    return { pizzaBalls: { rtRestTime: restTime } };
  }
}
