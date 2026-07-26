import { PizzaType } from '../settings/enums/pizza-type.enum';

import {
  clampSize,
  clampWeight,
  fallbackWeight,
  PIZZA_FORMATS,
  sizeForWeight,
  sizeOptions,
  sizeRange,
  weightForSize,
  weightOptions,
  weightRange,
} from './pizza-format.model';

/**
 * The single source of truth for the size ↔ ball-weight couple. Every value
 * below is pinned cell by cell: retuning a coefficient must show up in this
 * diff, never silently in a user's dough.
 */
describe('Pizza format model', () => {
  /** The published table of issue #99 — size in cm, ball weight in grams. */
  const TABLE: Record<PizzaType, readonly [number, number][]> = {
    [PizzaType.NEAPOLITAN]: [
      [26, 220],
      [27, 230],
      [28, 250],
      [29, 260],
      [30, 270],
      [31, 290],
      [32, 300],
      [33, 310],
      [34, 330],
      [35, 340],
    ],
    [PizzaType.ROMAN]: [
      [26, 130],
      [27, 140],
      [28, 150],
      [29, 160],
      [30, 170],
      [31, 180],
      [32, 190],
      [33, 210],
    ],
  };

  const styles = Object.values(PizzaType);

  for (const style of styles) {
    describe(style, () => {
      const rows = TABLE[style];

      for (const [size, weight] of rows) {
        it(`turns ${size} cm into ${weight} g`, () => {
          expect(weightForSize(style, size)).toBe(weight);
        });

        it(`reads ${weight} g back as ${size} cm`, () => {
          expect(sizeForWeight(style, weight)).toBe(size);
        });
      }

      it('proposes exactly the sizes of its range, one centimetre apart', () => {
        expect(sizeOptions(style)).toEqual(rows.map(([size]) => size));
      });

      it('grows strictly with the diameter', () => {
        const weights = rows.map(([size]) => weightForSize(style, size));

        for (let i = 1; i < weights.length; i += 1) {
          expect(weights[i]).toBeGreaterThan(weights[i - 1]);
        }
      });

      it('always lands on a multiple of 10 g', () => {
        for (const [size] of rows) {
          expect(weightForSize(style, size) % 10).toBe(0);
        }
      });

      it('bounds the weights by what its size range produces', () => {
        const produced = rows.map(([size]) => weightForSize(style, size));

        expect(weightRange(style)).toEqual({
          min: produced[0],
          max: produced[produced.length - 1],
        });
      });

      it('offers a 10 g weight grid covering every produced weight', () => {
        const grid = weightOptions(style);
        const { min, max } = weightRange(style);

        expect(grid[0]).toBe(min);
        expect(grid[grid.length - 1]).toBe(max);
        for (const [size] of rows) {
          expect(grid).toContain(weightForSize(style, size));
        }
      });

      it('brings a size from outside the range back to the nearest bound', () => {
        const { min, max } = sizeRange(style);

        expect(clampSize(style, min - 4)).toBe(min);
        expect(clampSize(style, max + 9)).toBe(max);
        expect(clampSize(style, min + 1)).toBe(min + 1);
      });

      it('brings a weight from outside the range back to the nearest bound', () => {
        const { min, max } = weightRange(style);

        expect(clampWeight(style, 400)).toBe(max);
        expect(clampWeight(style, 50)).toBe(min);
        expect(clampWeight(style, min + 10)).toBe(min + 10);
      });

      it('falls back on the weight of its reference size', () => {
        expect(fallbackWeight(style)).toBe(
          weightForSize(style, PIZZA_FORMATS[style].referenceSize),
        );
      });
    });
  }

  it('keeps the historic engine fallbacks to the gram', () => {
    expect(fallbackWeight(PizzaType.NEAPOLITAN)).toBe(250);
    expect(fallbackWeight(PizzaType.ROMAN)).toBe(180);
  });

  it('stops the Neapolitan at the AVPN limit and the Roman before the pala', () => {
    expect(sizeRange(PizzaType.NEAPOLITAN)).toEqual({ min: 26, max: 35 });
    expect(sizeRange(PizzaType.ROMAN)).toEqual({ min: 26, max: 33 });
  });

  it('reads a weight taken from another style back inside its own range', () => {
    // A 35 cm Neapolitan ball turned Roman: 340 g is far above the style.
    expect(sizeForWeight(PizzaType.ROMAN, 340)).toBe(33);
    expect(clampWeight(PizzaType.ROMAN, 340)).toBe(210);
  });

  it('describes the Roman as a rimless, purely surface-driven pizza', () => {
    expect(PIZZA_FORMATS[PizzaType.ROMAN].rimCoefficient).toBe(0);
    expect(PIZZA_FORMATS[PizzaType.NEAPOLITAN].rimCoefficient).toBeGreaterThan(
      0,
    );
  });
});
