import type { MethodIngredientKey } from './interfaces/method-def.interface';

/**
 * The one place that decides how the app weighs an ingredient out — the
 * precision it is rounded to and the digits it is then displayed with, kept
 * together so a quantity can never be rounded to the gram here and printed
 * with decimals there.
 *
 * Yeast is the exception every screen must honour (issue #110): at well
 * under 1 % of the flour, it is the only ingredient the cook doses on a
 * precision scale, and the only one whose dose drives the whole
 * fermentation. It is weighed and read at the centigram, everywhere;
 * everything else is read off a kitchen scale to the gram.
 */
const PRECISION_SCALE_DECIMALS = 2;
const KITCHEN_SCALE_DECIMALS = 0;

/** How many decimals an ingredient's grams are weighed and read with. */
function ingredientGramsDecimals(key: MethodIngredientKey): number {
  return key === 'yeast' ? PRECISION_SCALE_DECIMALS : KITCHEN_SCALE_DECIMALS;
}

/** The `NumberPipe` format an ingredient's grams are displayed with. */
export function ingredientGramsFormat(key: MethodIngredientKey): string {
  const decimals = ingredientGramsDecimals(key);

  return `1.${decimals}-${decimals}`;
}

/** The engine's raw grams, as the scale — and so the screen — reads them. */
export function roundIngredientGrams(
  key: MethodIngredientKey,
  grams: number,
): number {
  const precision = Math.pow(10, ingredientGramsDecimals(key));
  const weighed = Math.round(grams * precision) / precision;

  if (key !== 'yeast') {
    return weighed;
  }

  // A real pinch of yeast never rounds down to nothing: a poolish without
  // its yeast would narrate a lie. An absent one stays absent.
  return grams > 0 ? Math.max(1 / precision, weighed) : weighed;
}
