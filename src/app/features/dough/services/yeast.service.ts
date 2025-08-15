import { Injectable } from '@angular/core';
import { YeastType } from 'src/app/features/dough/enums/yeast-type.enum';
import {
  DRY_ACTIVE_YEAST_COEF,
  DRY_INSTANT_YEAST_COEF,
  FRESH_YEAST_COEF,
  BASE_TEMPERATURE,
  TEMPERATURE_FACTOR_COEF,
  YEAST_COLD_COEF,
  REFERENCE_HYDRATION,
  HYDRATION_FACTOR_COEF,
  SUGAR_FACTOR_COEF,
  MINIMUM_YEAST_PERCENTAGE,
  MAXIMUM_YEAST_PERCENTAGE,
  K_FACTOR_CONSTANTS,
  SALT_INHIBITION_COEF,
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

  /**
   * Continuous logistic model for the base yeast coefficient.
   * Provides a smooth transition between ultra-fast and very long fermentations.
   *
   * k(t) = K_MIN + (K_MAX - K_MIN) / [1 + (t / REF)^α]
   */
  private kFactor(equivalentTime: number): number {
    const { K_MIN, K_MAX, REF_FERM_TIME, K_EXPONENT } = K_FACTOR_CONSTANTS;
    const logisticPart =
      1 / (1 + Math.pow(equivalentTime / REF_FERM_TIME, K_EXPONENT));
    return K_MIN + (K_MAX - K_MIN) * logisticPart;
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

  private hydrationFactor(hydration: number) {
    // Hydration is expressed as a decimal (e.g. 0.65 for 65 %)
    return 1 + HYDRATION_FACTOR_COEF * (hydration - REFERENCE_HYDRATION);
  }

  private sugarFactor(sugar: number, flour: number) {
    // Baker's percentage: sugar / flour
    const sugarRatio = sugar / flour;
    return 1 + SUGAR_FACTOR_COEF * sugarRatio;
  }

  private saltFactor(salt: number, flour: number) {
    // Baker's percentage: salt / flour
    const saltRatio = salt / flour;
    // Inhibition factor: <1 slows fermentation; ensure it never reaches 0
    return 1 / (1 + SALT_INHIBITION_COEF * saltRatio);
  }

  private computePercentYeast(
    tEquivalent: number,
    temperatureFactor: number,
    hydrationFactor: number,
    sugarFactor: number,
    saltFactor: number,
    kFactor: number,
  ) {
    // Core scientific model – inversely proportional to accelerating factors
    // and directly proportional to inhibiting factors (saltFactor < 1 increases yeast)
    const denominator =
      tEquivalent *
      temperatureFactor *
      hydrationFactor *
      sugarFactor *
      saltFactor;
    return kFactor / denominator / 100;
  }

  private normalizeYeastWeight(yeastWeight: number, flour: number) {
    const min = (MINIMUM_YEAST_PERCENTAGE / 100) * flour;
    const max = (MAXIMUM_YEAST_PERCENTAGE / 100) * flour;
    const clamped = Math.max(min, Math.min(yeastWeight, max));
    return Math.round(clamped * 100) / 100; // round to 0.01 g
  }

  /**
   * Compute yeast quantity for a liquid poolish (100 % hydration).
   * @param temperature – dough temperature (°C)
   * @param yeastType – type of yeast (fresh, dry active, dry instant)
   * @param flour – flour weight in the poolish (g)
   * @param rtRestTime – room-temperature maturation (h)
   * @param coldRestTime – cold maturation (h)
   * @param sugar – simple sugar or honey weight in the poolish (g)
   */
  yeastForPoolish(
    temperature: number,
    yeastType: YeastType,
    flour: number,
    rtRestTime: number,
    coldRestTime: number,
    sugar: number,
  ) {
    const tEq = this.tEquivalent(rtRestTime, coldRestTime);
    const tempFactor = this.temperatureFactor(temperature);
    const hydFactor = this.hydrationFactor(1.0); // Poolish = 100 % hydration
    const sugFactor = this.sugarFactor(sugar, flour);
    const kFactor = this.kFactor(tEq);
    const percentYeast = this.computePercentYeast(
      tEq,
      tempFactor,
      hydFactor,
      sugFactor,
      1, // no salt in poolish
      kFactor,
    );

    const yeastWeight = this.convertYeastType(percentYeast * flour, yeastType);
    return this.normalizeYeastWeight(yeastWeight, flour);
  }

  /**
   * Compute yeast quantity for a direct-method dough (variable hydration).
   * @param temperature – dough temperature (°C)
   * @param yeastType – type of yeast (fresh, dry active, dry instant)
   * @param flour – total flour weight (g)
   * @param hydration – water ratio (e.g. 0.65 for 65 %)
   * @param sugar – sugar weight in the dough (g)
   * @param salt – salt weight in the dough (g)
   * @param rtRestTime – room-temperature maturation (h)
   * @param coldRestTime – cold maturation (h)
   */
  yeastForDough(
    temperature: number,
    yeastType: YeastType,
    flour: number,
    hydration: number,
    sugar: number,
    salt: number,
    rtRestTime: number,
    coldRestTime: number,
  ) {
    const tEq = this.tEquivalent(rtRestTime, coldRestTime);
    const tempFactor = this.temperatureFactor(temperature);
    const hydFactor = this.hydrationFactor(hydration);
    const sugFactor = this.sugarFactor(sugar, flour);
    const sltFactor = this.saltFactor(salt, flour);
    const kFactor = this.kFactor(tEq);
    const percentYeast = this.computePercentYeast(
      tEq,
      tempFactor,
      hydFactor,
      sugFactor,
      sltFactor,
      kFactor,
    );

    const yeastWeight = this.convertYeastType(percentYeast * flour, yeastType);
    return this.normalizeYeastWeight(yeastWeight, flour);
  }
}
