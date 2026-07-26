import { range } from 'src/app/shared/helpers/range';

import { PizzaType } from '../settings/enums/pizza-type.enum';

/**
 * How one pizza style turns a diameter into a ball weight.
 *
 * The mass splits the way the pizza itself does: a base of roughly constant
 * thickness, whose mass follows the *area*, and a cornicione of roughly
 * constant section, whose mass follows the *circumference*. Hence two terms:
 *
 * ```
 * W(d) = base·d² + rim·d          (d in cm, W in g)
 * ```
 *
 * `rim = 0` on the Roman is not a shortcut: the tonda romana has no rim, so
 * its mass is purely surface-driven. That single coefficient is also why the
 * Neapolitan weight grows more slowly with the diameter than the Roman's.
 */
export interface IPizzaFormat {
  /** `base` — grams per cm² of dough floor. */
  readonly baseCoefficient: number;
  /** `rim` — grams per cm of cornicione. */
  readonly rimCoefficient: number;
  /** Smallest diameter the style is offered at, in centimetres. */
  readonly minSize: number;
  /** Largest diameter the style is offered at, in centimetres. */
  readonly maxSize: number;
  /** The diameter the style falls back to when no size was answered. */
  readonly referenceSize: number;
}

/** Every produced weight lands on this grid, the Expert stepper's own step. */
export const WEIGHT_STEP = 10;

/**
 * The coefficients and the business bounds of each style.
 *
 * The bounds carry knowledge the formula does not: the AVPN disciplinare caps
 * the Neapolitan at 35 cm, and past ~33 cm the tonda romana gives way to the
 * pala. The model stays numerically valid well beyond — which is exactly the
 * risk — so the range is a datum of this module, not a rendering detail.
 */
export const PIZZA_FORMATS: Readonly<Record<PizzaType, IPizzaFormat>> = {
  [PizzaType.NEAPOLITAN]: {
    baseCoefficient: 0.152,
    rimCoefficient: 4.5,
    minSize: 26,
    maxSize: 35,
    referenceSize: 28,
  },
  [PizzaType.ROMAN]: {
    baseCoefficient: 0.189,
    rimCoefficient: 0,
    minSize: 26,
    maxSize: 33,
    referenceSize: 31,
  },
};

/**
 * The ball weight a pizza of `sizeCm` asks for, rounded to 10 g.
 *
 * The rounding is not cosmetic: it aligns every produced weight with the
 * Expert weight grid, which makes the size → weight → size round trip exact
 * and keeps a weight coming from the Intermediate path reachable in Expert.
 */
export function weightForSize(pizzaType: PizzaType, sizeCm: number): number {
  const { baseCoefficient, rimCoefficient } = PIZZA_FORMATS[pizzaType];
  const size = clampSize(pizzaType, sizeCm);
  const raw = baseCoefficient * size * size + rimCoefficient * size;

  return Math.round(raw / WEIGHT_STEP) * WEIGHT_STEP;
}

/**
 * The pizza size a ball of `grams` makes, in whole centimetres — the inverse
 * of {@link weightForSize}, clamped to the style so a weight inherited from
 * another style (or from a Dough saved before the bounds existed) always
 * reads as a size the style can actually produce.
 */
export function sizeForWeight(pizzaType: PizzaType, grams: number): number {
  const { baseCoefficient: base, rimCoefficient: rim } =
    PIZZA_FORMATS[pizzaType];
  // Positive root of base·d² + rim·d − W = 0.
  const raw =
    (-rim + Math.sqrt(rim * rim + 4 * base * Math.max(grams, 0))) / (2 * base);

  return clampSize(pizzaType, raw);
}

/** The sizes the style proposes, one centimetre apart. */
export function sizeOptions(pizzaType: PizzaType): number[] {
  const { minSize, maxSize } = PIZZA_FORMATS[pizzaType];

  return range(minSize, maxSize);
}

/** The bounds of the sizes the style proposes, in centimetres. */
export function sizeRange(pizzaType: PizzaType): { min: number; max: number } {
  const { minSize, maxSize } = PIZZA_FORMATS[pizzaType];

  return { min: minSize, max: maxSize };
}

/** The ball weights the style's size range produces, in grams. */
export function weightRange(pizzaType: PizzaType): {
  min: number;
  max: number;
} {
  const { min, max } = sizeRange(pizzaType);

  return {
    min: weightForSize(pizzaType, min),
    max: weightForSize(pizzaType, max),
  };
}

/** The 10 g weight grid the style allows — the Expert tile walks this list. */
export function weightOptions(pizzaType: PizzaType): number[] {
  const { min, max } = weightRange(pizzaType);

  return range(min, max, WEIGHT_STEP);
}

/**
 * A size brought back into the style, rounded to the centimetre. Applied
 * wherever a value can arrive from elsewhere: another path's Draft, a saved
 * Dough, a style change. Idempotent by construction.
 */
export function clampSize(pizzaType: PizzaType, sizeCm: number): number {
  const { min, max } = sizeRange(pizzaType);

  return Math.min(max, Math.max(min, Math.round(sizeCm)));
}

/** A ball weight brought back to the nearest bound of the style. */
export function clampWeight(pizzaType: PizzaType, grams: number): number {
  const { min, max } = weightRange(pizzaType);

  return Math.min(max, Math.max(min, grams));
}

/**
 * The weight the engine falls back to when no ball weight was answered —
 * the weight of the style's reference size, which lands exactly on the
 * historic fallbacks (250 g Neapolitan, 180 g Roman).
 */
export function fallbackWeight(pizzaType: PizzaType): number {
  return weightForSize(pizzaType, PIZZA_FORMATS[pizzaType].referenceSize);
}
