import { Injectable } from '@angular/core';
import { IProcessor } from '../../interfaces/processor.interface';
import { ITimings } from '../../interfaces/timing.interface';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { DoughType } from '../../enums/dough-type.enum';

export const DOUGH_BASE_TIME = 1;

@Injectable({
  providedIn: 'root',
})
export class TimingsProcessor implements IProcessor {
  process(
    input: ICalculatorInput,
    acc: { pizzaBalls: { rtRestTime: number } },
  ): ITimings {
    const pizzaBallsRest = acc.pizzaBalls.rtRestTime;
    const timings = this.computeTimingsFromRestTimes({
      globalRestTime: input.globalRestTime,
      rtRestTime: input.rtRestTime,
      coldRestTime: input.coldRestTime,
      method: input.doughType,
      temperature: input.temperature,
      pizzaBallsRestTime: pizzaBallsRest,
    });

    return timings;
  }

  computeTimingsFromRestTimes(input: {
    globalRestTime: number | null;
    rtRestTime: number | null;
    coldRestTime: number | null;
    method: DoughType;
    temperature: number;
    pizzaBallsRestTime: number;
  }): ITimings {
    if (!input.globalRestTime && !input.rtRestTime && !input.coldRestTime) {
      input.globalRestTime = 0; // To avoid errors if subscribed but not set yet
    }

    let coldRestTime = input.coldRestTime ?? 0;
    let rtRestTime = input.rtRestTime ?? 0;
    if (input.globalRestTime) {
      const tmpRes = this.computeRestTimesFromGlobalRestTime(
        input.globalRestTime,
        input.method,
      );
      coldRestTime = tmpRes.coldRestTime;
      rtRestTime = tmpRes.rtRestTime;
    }

    const hasPoolish = input.method === DoughType.POOLISH;
    const pizzaBallsRestTime = input.pizzaBallsRestTime;
    const poolishPrepTime = hasPoolish
      ? DOUGH_BASE_TIME + rtRestTime + coldRestTime + (coldRestTime ? 1 : 0)
      : 0;

    const doughPrepTime =
      DOUGH_BASE_TIME +
      (!hasPoolish ? rtRestTime + coldRestTime + (coldRestTime ? 1 : 0) : 0);

    const pizzaBallsPrepTime = pizzaBallsRestTime;

    return {
      poolish: {
        coldRestTime: hasPoolish ? coldRestTime : 0,
        rtRestTime: hasPoolish ? rtRestTime : 0,
        prepTime: poolishPrepTime,
      },
      dough: {
        coldRestTime: !hasPoolish ? coldRestTime : 0,
        rtRestTime: !hasPoolish ? rtRestTime : 0,
        prepTime: doughPrepTime,
      },
      pizzaBalls: {
        rtRestTime: pizzaBallsRestTime,
        prepTime: pizzaBallsPrepTime,
        coldRestTime: 0,
      },
      total: {
        prepTime: poolishPrepTime + doughPrepTime + pizzaBallsPrepTime,
        coldRestTime: coldRestTime,
        rtRestTime: rtRestTime + pizzaBallsRestTime,
      },
    };
  }

  computeRestTimesFromGlobalRestTime(
    globalRestTime: number,
    doughType: DoughType,
  ) {
    let coldRestTime = 0;
    let rtRestTime = 0;
    let restTimeLeft = globalRestTime;

    if (doughType === DoughType.DIRECT) {
      rtRestTime = Math.min(restTimeLeft, 24);
      restTimeLeft -= rtRestTime;
      coldRestTime = restTimeLeft;
      restTimeLeft = 0;
    }

    if (doughType === DoughType.POOLISH) {
      rtRestTime = 1;
      restTimeLeft -= 1;
      if (restTimeLeft > 12) {
        coldRestTime = restTimeLeft;
        restTimeLeft = 0;
      } else {
        rtRestTime += restTimeLeft;
        restTimeLeft = 0;
      }
    }

    return {
      coldRestTime,
      rtRestTime,
    };
  }
}
