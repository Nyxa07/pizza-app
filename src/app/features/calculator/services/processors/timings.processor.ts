import { Injectable } from '@angular/core';
import { DOUGH_BASE_TIME } from '../../dough.constants';
import type { OutputSlice } from './output-field';
import type { IProcessor } from './processor.interface';
import { ITimings } from '../../interfaces/timing.interface';
import { ICalculatorInput } from '../../interfaces/calculator-input.interface';
import { DoughType } from '../../enums/dough-type.enum';

const READS = ['pizzaBalls.rtRestTime'] as const;
const WRITES = [
  'poolish.coldRestTime',
  'poolish.rtRestTime',
  'poolish.prepTime',
  'dough.coldRestTime',
  'dough.rtRestTime',
  'dough.prepTime',
  'pizzaBalls.coldRestTime',
  'pizzaBalls.prepTime',
  'total.coldRestTime',
  'total.rtRestTime',
  'total.prepTime',
] as const;

type Reads = (typeof READS)[number];
type Writes = (typeof WRITES)[number];

@Injectable({
  providedIn: 'root',
})
export class TimingsProcessor implements IProcessor<Reads, Writes> {
  readonly reads = READS;
  readonly writes = WRITES;

  process(
    input: ICalculatorInput,
    acc: OutputSlice<Reads>,
  ): OutputSlice<Writes> {
    const pizzaBallsRest = acc.pizzaBalls.rtRestTime;
    const timings = this.computeTimingsFromRestTimes({
      globalRestTime: input.globalRestTime,
      rtRestTime: input.rtRestTime,
      coldRestTime: input.coldRestTime,
      method: input.doughType,
      temperature: input.temperature,
      pizzaBallsRestTime: pizzaBallsRest,
    });

    return {
      poolish: timings.poolish,
      dough: timings.dough,
      // The balls' own rest is read, not written: it belongs to the step that
      // derives it from the temperature, and a field has one author.
      pizzaBalls: {
        coldRestTime: timings.pizzaBalls.coldRestTime,
        prepTime: timings.pizzaBalls.prepTime,
      },
      total: timings.total,
    };
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
