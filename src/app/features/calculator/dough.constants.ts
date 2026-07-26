import { PizzaType } from '../settings/enums/pizza-type.enum';

/**
 * The flour a calculator path assumes when it does not ask for one. The W
 * value is absent from most flour bags, so the approachable paths apply this
 * — exactly what the Guided « Je ne sais pas » answer produced before its
 * step was removed (issue #99).
 */
export const ASSUMED_FLOUR_STRENGTH = 270;

type HydrationCfg = {
  referenceW: number;
  baseHydration: number;
  slope: number;
  minHydration: number;
  maxHydration: number;
};

export type KFactorConstants = {
  /** Minimum yeast coefficient for very long fermentation (>24 h) */
  kMin: number;
  /** Maximum yeast coefficient for ultra-fast fermentation (<4 h) */
  kMax: number;
  /** Reference equivalent fermentation time (hours) where the coefficient is mid-range */
  refFermTime: number;
  /** Exponent controlling the steepness of the logistic curve */
  kExponent: number;
};

export type DoughConstants = {
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

  /** Parameters for effective hydration based on flour strength */
  hydrationRecommendation: {
    [key in PizzaType]: HydrationCfg;
  };

  /** Parameters for pizza-balls rest time */
  pizzaBallsRestTime: {
    // Temperature boundaries for the interpolation (°C)
    minTemperature: number;
    maxTemperature: number;

    // Default min/max rest times coef to apply to total rest time to get min/max pizza balls rest time (h)
    minRestTimeCoef: number;
    maxRestTimeCoef: number;
    maxTotalRestTime: number;
  };
};

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
    [PizzaType.NEAPOLITAN]: {
      referenceW: 270,
      baseHydration: 0.607,
      slope: 0.0007,
      minHydration: 0.55,
      maxHydration: 0.78,
    },
    [PizzaType.ROMAN]: {
      referenceW: 270,
      baseHydration: 0.55,
      slope: 0.000625,
      minHydration: 0.55,
      maxHydration: 0.6,
    },
  },

  pizzaBallsRestTime: {
    minTemperature: 19,
    maxTemperature: 25,

    // These two were historically used by the UI; keep them for reference.
    minRestTimeCoef: 0.05,
    maxRestTimeCoef: 0.15,
    maxTotalRestTime: 24,
  },
} as const;

// --------------------------------------------------------------------------------
// NOTE ▸ Future migrations
// If you ever add new fields here, make sure to update any persistence schemas
// (e.g. the DoughConfigService) so that stale overrides do not break the merge
// with these defaults.
// --------------------------------------------------------------------------------
