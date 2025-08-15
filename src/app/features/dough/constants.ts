// Poolish
export const HONEY_RATIO = 0.1;
export const BASE_HONEY_AMOUNT = 5;

// Yeast
export const YEAST_COLD_COEF = 0.05;
export const FRESH_YEAST_COEF = 3;
export const DRY_ACTIVE_YEAST_COEF = 1.3;
export const DRY_INSTANT_YEAST_COEF = 1;
export const SALT_WEIGHT_PER_PIZZA = 4.5;
export const PIZZA_WEIGHT = 250;

// Enhanced yeast calculation constants
export const BASE_TEMPERATURE = 20; // Base temperature in °C
export const TEMPERATURE_FACTOR_COEF = 0.15; // Temperature coefficient per °C (improved for significant impact)
export const MINIMUM_YEAST_PERCENTAGE = 0.01; // Minimum 0.01% of flour weight (more flexible)
export const MAXIMUM_YEAST_PERCENTAGE = 5.0; // Maximum 5% of flour weight (more flexible)
export const YEAST_ACTIVATION_TIME = 1; // 1 hour for yeast activation
export const FERMENTATION_OPTIMAL_RANGE = {
  MIN: 4, // Minimum optimal fermentation time
  MAX: 24, // Maximum optimal fermentation time
};
