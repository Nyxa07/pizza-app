import { Injectable } from '@angular/core';
import { YeastType } from 'src/app/features/dough/enums/yeast-type.enum';
import {
  DRY_ACTIVE_YEAST_COEF,
  DRY_INSTANT_YEAST_COEF,
  FERMENTATION_OPTIMAL_RANGE,
  FRESH_YEAST_COEF,
  BASE_TEMPERATURE,
  TEMPERATURE_FACTOR_COEF,
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
    return 1 + TEMPERATURE_FACTOR_COEF * (temperature - BASE_TEMPERATURE);
  }

  private percentYeast(
    tEquivalent: number,
    temperatureFactor: number,
    kFactor: number,
  ) {
    return kFactor / (tEquivalent * temperatureFactor) / 100;
  }

  private kFactor(equivalentTime: number) {
    // Very long fermentation (>24h): minimal yeast to avoid acidity
    if (equivalentTime > FERMENTATION_OPTIMAL_RANGE.MAX) {
      return 0.35;
    }

    // Long fermentation (16-24h): reduced yeast for slow development
    if (equivalentTime > 16) {
      return 0.7;
    }

    // Standard fermentation (12-16h): balanced yeast
    if (equivalentTime > 12) {
      return 1.0;
    }

    // Fast fermentation (8-12h): increased yeast
    if (equivalentTime > 8) {
      return 1.3;
    }

    // Very fast fermentation (4-8h): important yeast
    if (equivalentTime > FERMENTATION_OPTIMAL_RANGE.MIN) {
      return 1.6;
    }

    // Ultra-fast fermentation (<4h): maximum yeast
    return 2.0;
  }

  private convertYeastType(weight: number, yeastType: YeastType): number {
    switch (yeastType) {
      case YeastType.FRESH:
        // Fresh yeast: more water, less concentrated
        return weight * FRESH_YEAST_COEF;

      case YeastType.DRY_ACTIVE:
        // Active dry yeast: requires activation
        return weight * DRY_ACTIVE_YEAST_COEF;

      case YeastType.DRY_INSTANT:
        // Instant dry yeast: reference (1:1)
        return weight * DRY_INSTANT_YEAST_COEF;

      default:
        return weight;
    }
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
    const kFactor = this.kFactor(tEquivalent);
    const percentYeast = this.percentYeast(
      tEquivalent,
      temperatureFactor,
      kFactor,
    );

    const yeastWeight = this.convertYeastType(percentYeast * flour, yeastType);
    return Math.max(0.1, Math.round(yeastWeight * 100) / 100);
  }
}
