import { Injectable } from '@angular/core';
import { YeastType } from 'src/app/features/dough/enums/yeast-type.enum';
import {
  DRY_ACTIVE_YEAST_COEF,
  DRY_INSTANT_YEAST_COEF,
  FRESH_YEAST_COEF,
  YEAST_COLD_COEF,
} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class YeastService {
  private tEquivalent(tHot: number, tCold: number) {
    return tHot + tCold * YEAST_COLD_COEF;
  }

  private temperatureFactor(temperature: number) {
    return 1 + 0.03 * (temperature - 20);
  }

  private percentYeast(
    tEquivalent: number,
    temperatureFactor: number,
    kFactor: number,
    yeastType: YeastType,
  ) {
    const res = kFactor / (tEquivalent * temperatureFactor) / 100;
    return (
      res *
      (yeastType === YeastType.FRESH
        ? FRESH_YEAST_COEF
        : yeastType === YeastType.DRY_ACTIVE
          ? DRY_ACTIVE_YEAST_COEF
          : DRY_INSTANT_YEAST_COEF)
    );
  }

  private kFactor(tEquivalent: number) {
    if (tEquivalent > 24) {
      return 0.4;
    }
    if (tEquivalent > 16) {
      return 0.8;
    }
    if (tEquivalent > 12) {
      return 1;
    }
    if (tEquivalent > 4) {
      return 1.2;
    }
    return 1.5;
  }

  yeastQuantity(
    temperature: number,
    yeastType: YeastType,
    flour: number,
    rtRestTime: number,
    coldRestTime: number,
  ) {
    const tEquivalent = this.tEquivalent(rtRestTime, coldRestTime);
    const temperatureFactor = this.temperatureFactor(temperature);
    const kFactor = this.kFactor(tEquivalent); // Add 1 hour, time for the yeast to be stopped
    const percentYeast = this.percentYeast(
      tEquivalent,
      temperatureFactor,
      kFactor,
      yeastType,
    );

    return Math.max(0.1, Math.round(percentYeast * flour * 10) / 10);
  }
}
