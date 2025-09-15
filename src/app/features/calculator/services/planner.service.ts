import { Injectable } from '@angular/core';
import { DoughType } from '../enums/dough-type.enum';
import { RestTimeService } from './rest-time.service';

export const DOUGH_BASE_TIME = 1;

export interface TimingPart {
  coldRestTime: number;
  rtRestTime: number;
  prepTime: number;
}

export interface Timings {
  poolish: TimingPart;
  dough: TimingPart;
  pizzaBalls: TimingPart;
  total: TimingPart;
}

@Injectable({
  providedIn: 'root',
})
export class PlannerService {
  constructor(private restTimeService: RestTimeService) {}

  computeTimingsFromRestTimes(input: {
    globalRestTime?: number;
    rtRestTime?: number;
    coldRestTime?: number;
    method: DoughType;
    temperature: number;
  }): Timings {
    if (!input.globalRestTime && !input.rtRestTime && !input.rtRestTime) {
      throw new Error('At least one rest time must be provided');
    }

    let coldRestTime = 0;
    let rtRestTime = 0;
    if (input.globalRestTime) {
      const tmpRes = this.getRestTimesFromGlobalRestTime(
        input.globalRestTime,
        input.method,
      );
      coldRestTime = tmpRes.coldRestTime;
      rtRestTime = tmpRes.rtRestTime;
    }
    const hasPoolish = input.method === DoughType.POOLISH;
    const pizzaBallsRestTime = this.restTimeService.computePizzaBallsRestTime(
      input.temperature,
      rtRestTime,
      coldRestTime,
    );
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

  getRestTimesFromGlobalRestTime(globalRestTime: number, doughType: DoughType) {
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
