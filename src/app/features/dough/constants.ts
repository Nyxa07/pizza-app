// Poolish
export const HONEY_RATIO = 0.1;
export const BASE_HONEY_AMOUNT = 5;

// Yeast
export const YEAST_COLD_COEF = 0.05;
export const FRESH_YEAST_COEF = 3;
export const DRY_ACTIVE_YEAST_COEF = 1.3;
export const DRY_INSTANT_YEAST_COEF = 1;
/**
 * Default salt ratio (baker's percentage).
 * 2.8 % of flour weight is a classic value for Neapolitan-style pizza.
 */
export const SALT_RATIO = 0.028;

// Pizza weight
export const PIZZA_WEIGHT = 250;

// Enhanced yeast calculation constants
export const BASE_TEMPERATURE = 20; // Base temperature in °C
export const TEMPERATURE_FACTOR_COEF = 0.15; // Temperature coefficient per °C (improved for significant impact)
export const MINIMUM_YEAST_PERCENTAGE = 0.02; // Minimum 0.02% of flour weight – matches very long cold ferment
export const MAXIMUM_YEAST_PERCENTAGE = 2.0; // Maximum 2% of flour weight – realistic upper bound

// Hydration effect – water percentage strongly influences fermentation speed
export const REFERENCE_HYDRATION = 0.6; // 60 % hydration reference for standard pizza dough
export const HYDRATION_FACTOR_COEF = 1.5; // Activity increase per 1.0 hydration delta (e.g. 70 % vs 60 %)

// Sugar effect – simple sugars (honey, malt, etc.) feed the yeast
export const SUGAR_FACTOR_COEF = 15; // Each 1 % sugar (baker's %) multiplies yeast activity by ≈15 %

// Continuous k-factor logistic model parameters
export const K_FACTOR_CONSTANTS = {
  /** Minimum yeast coefficient for very long fermentation (>24 h) */
  K_MIN: 0.35,
  /** Maximum yeast coefficient for ultra-fast fermentation (<4 h) */
  K_MAX: 2.0,
  /** Reference equivalent fermentation time (hours) where coefficient ≈ mid-range */
  REF_FERM_TIME: 12,
  /** Exponent controlling steepness of the logistic curve (dimensionless) */
  K_EXPONENT: 2,
} as const;

// Salt effect – salt slows down yeast activity (higher ratio = stronger inhibition)
export const SALT_INHIBITION_COEF = 4; // Each 1% salt reduces activity efficacy
