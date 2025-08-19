import { Injectable } from '@angular/core';
import { CalculatorConfigService } from './calculator-config.service';

export interface HydrationRange {
  /** Lower bound of recommended hydration (decimal, e.g. 0.60 for 60 %) */
  minHydration: number;
  /** Upper bound of recommended hydration (decimal, e.g. 0.65 for 65 %) */
  maxHydration: number;
}

@Injectable({ providedIn: 'root' })
export class HydrationService {
  constructor(private calculatorConfigService: CalculatorConfigService) {}

  /**
   * Returns the recommended hydration range (min / max) for a given flour strength (W).
   * The central recommendation is computed via a linear model and then a symmetric tolerance
   * of ±tolerance around that value is applied. Finally, the range is clamped by the hard
   * limits defined in the configuration.
   */
  compute(flourStrength: number): HydrationRange {
    const mid = this.recommendedHydration(flourStrength);
    const cfg = this.calculatorConfigService.constants.hydrationRecommendation;

    // 2 % absolute tolerance yields a sensible ± window (can be adjusted later via cfg)
    const tolerance = 0.02;

    const minHydration = Math.max(cfg.minHydration, mid - tolerance);
    const maxHydration = Math.min(cfg.maxHydration, mid + tolerance);

    return { minHydration, maxHydration };
  }

  /**
   * Central recommended hydration ratio (water / flour) for a given flour strength (W).
   * Uses a linear model: h = base + slope * (W - reference), then clamps to config bounds.
   */
  private recommendedHydration(W: number): number {
    const cfg = this.calculatorConfigService.constants.hydrationRecommendation;
    const raw = cfg.baseHydration + cfg.slope * (W - cfg.referenceW);
    return Math.max(cfg.minHydration, Math.min(cfg.maxHydration, raw));
  }
}
