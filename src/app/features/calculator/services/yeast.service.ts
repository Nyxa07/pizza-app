import { Injectable } from '@angular/core';
import { YeastType } from 'src/app/features/calculator/enums/yeast-type.enum';
import { CalculatorConfigService } from './calculator-config.service';

@Injectable({
  providedIn: 'root',
})
export class YeastService {
  constructor(private calculatorConfig: CalculatorConfigService) {}

  private tEquivalent(tHot: number, tCold: number) {
    return tHot + tCold * this.calculatorConfig.constants.yeast.coldCoef;
  }

  private temperatureFactor(temperature: number) {
    return (
      1 +
      this.calculatorConfig.constants.yeast.temperatureFactorCoef *
        (temperature - this.calculatorConfig.constants.yeast.baseTemperature)
    );
  }

  /**
   * Continuous logistic model for the base yeast coefficient.
   * Provides a smooth transition between ultra-fast and very long fermentations.
   *
   * k(t) = K_MIN + (K_MAX - K_MIN) / [1 + (t / REF)^α]
   */
  private kFactor(equivalentTime: number): number {
    const { kMin, kMax, refFermTime, kExponent } =
      this.calculatorConfig.constants.yeast.kFactor;
    const logisticPart =
      1 / (1 + Math.pow(equivalentTime / refFermTime, kExponent));
    return kMin + (kMax - kMin) * logisticPart;
  }

  private convertYeastType(weight: number, yeastType: YeastType): number {
    switch (yeastType) {
      case YeastType.FRESH:
        // Fresh yeast: more water, less concentrated
        return weight * this.calculatorConfig.constants.yeast.freshCoef;

      case YeastType.DRY_ACTIVE:
        // Active dry yeast: requires activation
        return weight * this.calculatorConfig.constants.yeast.dryActiveCoef;

      case YeastType.DRY_INSTANT:
        // Instant dry yeast: reference (1:1)
        return weight * this.calculatorConfig.constants.yeast.dryInstantCoef;

      default:
        return weight;
    }
  }

  private hydrationFactor(hydration: number) {
    // Hydration is expressed as a decimal (e.g. 0.65 for 65 %)
    return (
      1 +
      this.calculatorConfig.constants.yeast.hydrationFactorCoef *
        (hydration - this.calculatorConfig.constants.yeast.referenceHydration)
    );
  }

  private sugarFactor(sugar: number, flour: number) {
    // Baker's percentage: sugar / flour
    const sugarRatio = sugar / flour;
    return (
      1 + this.calculatorConfig.constants.yeast.sugarFactorCoef * sugarRatio
    );
  }

  private saltFactor(salt: number, flour: number) {
    // Baker's percentage: salt / flour
    const saltRatio = salt / flour;
    // Inhibition factor: <1 slows fermentation; ensure it never reaches 0
    return (
      1 /
      (1 + this.calculatorConfig.constants.yeast.saltInhibitionCoef * saltRatio)
    );
  }

  private flourStrengthFactor(W: number) {
    const { referenceW, coef } =
      this.calculatorConfig.constants.yeast.flourStrength;
    // Stronger flour (higher W) should LOWER yeast. We want factor >1 when W > reference.
    // Formula: 1 + coef * (W - referenceW) / referenceW
    return 1 + (coef * (W - referenceW)) / referenceW;
  }

  private computePercentYeast(
    tEquivalent: number,
    temperatureFactor: number,
    hydrationFactor: number,
    sugarFactor: number,
    saltFactor: number,
    flourStrengthFactor: number,
    kFactor: number,
  ) {
    const denominator =
      tEquivalent *
      temperatureFactor *
      hydrationFactor *
      sugarFactor *
      saltFactor *
      flourStrengthFactor;
    return kFactor / denominator / 100;
  }

  private normalizeYeastWeight(yeastWeight: number, flour: number) {
    const min =
      (this.calculatorConfig.constants.yeast.minimumPercentage / 100) * flour;
    const max =
      (this.calculatorConfig.constants.yeast.maximumPercentage / 100) * flour;
    const clamped = Math.max(min, Math.min(yeastWeight, max));
    return clamped;
  }

  /**
   * Compute yeast quantity for a liquid poolish (100 % hydration).
   * @param temperature – dough temperature (°C)
   * @param yeastType – type of yeast (fresh, dry active, dry instant)
   * @param flour – flour weight in the poolish (g)
   * @param rtRestTime – room-temperature maturation (h)
   * @param coldRestTime – cold maturation (h)
   * @param sugar – simple sugar or honey weight in the poolish (g)
   * @param flourStrengthW – flour strength (W-value)
   */
  yeastForPoolish(
    temperature: number,
    yeastType: YeastType,
    flour: number,
    rtRestTime: number,
    coldRestTime: number,
    sugar: number,
    flourStrengthW: number,
  ) {
    const tEq = this.tEquivalent(rtRestTime, coldRestTime);
    const tempFactor = this.temperatureFactor(temperature);
    const hydFactor = this.hydrationFactor(1.0); // Poolish = 100 % hydration
    const sugFactor = this.sugarFactor(sugar, flour);
    const kFactor = this.kFactor(tEq);
    const flrFactor = this.flourStrengthFactor(flourStrengthW);
    const percentYeast = this.computePercentYeast(
      tEq,
      tempFactor,
      hydFactor,
      sugFactor,
      1, // no salt in poolish
      flrFactor,
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
   * @param flourStrengthW – flour strength (W-value)
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
    flourStrengthW: number,
  ) {
    const tEq = this.tEquivalent(rtRestTime, coldRestTime);
    const tempFactor = this.temperatureFactor(temperature);
    const hydFactor = this.hydrationFactor(hydration);
    const sugFactor = this.sugarFactor(sugar, flour);
    const sltFactor = this.saltFactor(salt, flour);
    const kFactor = this.kFactor(tEq);
    const flrFactor = this.flourStrengthFactor(flourStrengthW);
    const percentYeast = this.computePercentYeast(
      tEq,
      tempFactor,
      hydFactor,
      sugFactor,
      sltFactor,
      flrFactor,
      kFactor,
    );

    const yeastWeight = this.convertYeastType(percentYeast * flour, yeastType);
    return this.normalizeYeastWeight(yeastWeight, flour);
  }
}
