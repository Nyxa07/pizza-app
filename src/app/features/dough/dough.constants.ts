// --------------------------------------------------------------------------------
// DO NOT import this file outside of the dough feature unless the value really is
// dough-specific business logic. For application-wide configuration use a shared
// settings service instead.
// --------------------------------------------------------------------------------

// A strongly-typed, namespaced representation of every constant that influences
// the dough calculations.  Having everything in one immutable object makes it
// trivial to:
//   • expose the structure through a configuration service;
//   • persist selective overrides (only the delta needs storing);
//   • reset to factory defaults (just spread the object again).

export interface KFactorConstants {
  /** Minimum yeast coefficient for very long fermentation (>24 h) */
  kMin: number;
  /** Maximum yeast coefficient for ultra-fast fermentation (<4 h) */
  kMax: number;
  /** Reference equivalent fermentation time (hours) where the coefficient is mid-range */
  refFermTime: number;
  /** Exponent controlling the steepness of the logistic curve */
  kExponent: number;
}

export interface DoughConstants {
  /** All yeast and fermentation related tweaking coefficients. */
  yeast: {
    /** Base loss of activity when the dough is retarded in the fridge (dimensionless). */
    coldCoef: number;
    /** Conversion factor fresh yeast → dry instant. */
    freshCoef: number;
    /** Conversion factor active dry yeast → dry instant. */
    dryActiveCoef: number;
    /** Main reference factor for instant dry yeast. */
    dryInstantCoef: number;

    /** Each 1 % salt (baker’s %) reduces yeast activity by this coefficient. */
    saltInhibitionCoef: number;

    /** Base ambient temperature in °C for the model. */
    baseTemperature: number;
    /** Variance of yeast activity per additional °C. */
    temperatureFactorCoef: number;

    /** Minimum & maximum baker’s percentages allowed by the UI. */
    minimumPercentage: number;
    maximumPercentage: number;

    /** Hydration & sugar effects. */
    referenceHydration: number;
    hydrationFactorCoef: number;
    sugarFactorCoef: number;

    /** Parameters for the continuous k-factor logistic model. */
    kFactor: KFactorConstants;

    /** Parameters governing how flour strength (W-value) affects yeast */
    flourStrength: {
      referenceW: number;
      coef: number;
    };
  };

  /** Parameters for recommended hydration based on flour strength */
  hydrationRecommendation: {
    /** Reference W at which base hydration applies */
    referenceW: number;
    /** Base hydration (decimal, e.g. 0.55 for 55 %) when W = referenceW */
    baseHydration: number;
    /** Linear slope applied per W point above/below reference (decimal per W) */
    slope: number;
    /** Hard lower bound */
    minHydration: number;
    /** Hard upper bound */
    maxHydration: number;
  };
}

export const DEFAULT_DOUGH_CONSTANTS: DoughConstants = {
  yeast: {
    coldCoef: 0.05,
    freshCoef: 3,
    dryActiveCoef: 1.3,
    dryInstantCoef: 1,

    saltInhibitionCoef: 4,

    baseTemperature: 20,
    temperatureFactorCoef: 0.15,

    minimumPercentage: 0.02,
    maximumPercentage: 2.0,

    referenceHydration: 0.6,
    hydrationFactorCoef: 1.5,
    sugarFactorCoef: 15,

    kFactor: {
      kMin: 0.35,
      kMax: 2.0,
      refFermTime: 12,
      kExponent: 2,
    },

    flourStrength: {
      referenceW: 300,
      coef: 0.4,
    },
  },

  // saltRatio: 0.028,
  // pizzaWeight: 250,
  // honeyRatio: 0.004,

  hydrationRecommendation: {
    referenceW: 160,
    baseHydration: 0.55,
    slope: 0.0007,
    minHydration: 0.55,
    maxHydration: 0.8,
  },
} as const;

// --------------------------------------------------------------------------------
// NOTE ▸ Future migrations
// If you ever add new fields here, make sure to update any persistence schemas
// (e.g. the DoughConfigService) so that stale overrides do not break the merge
// with these defaults.
// --------------------------------------------------------------------------------
