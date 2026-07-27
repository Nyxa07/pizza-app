import { TestBed } from '@angular/core/testing';

import { SUGGESTED_DOUGHS } from 'src/app/features/recipes/recipes.catalog';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { PizzaType } from '../settings/enums/pizza-type.enum';
import { EXPERT_FIELD_OPTIONS } from './expert-form/expert-field-options';
import {
  clampWeight,
  fallbackWeight,
  sizeForWeight,
  weightForSize,
  weightOptions,
  weightRange,
} from './pizza-format.model';
import { CalculatorService } from './services/calculator.service';
import { FACTORY_DEFAULTS } from './services/dough-defaults.service';

/**
 * The net that keeps the four historic ball-weight sources of truth from
 * growing back: the Expert grid, the engine fallback, the factory Default and
 * the Recipe catalog all derive from the pizza format model, or these fail.
 */
describe('The single source of truth for ball weights', () => {
  const styles = Object.values(PizzaType);

  it('leaves no static weight grid behind in the Expert options', () => {
    expect('pizzaWeight' in EXPERT_FIELD_OPTIONS).toBeFalse();
  });

  for (const style of styles) {
    it(`bounds the ${style} weight grid by what the model produces`, () => {
      const grid = weightOptions(style);
      const { min, max } = weightRange(style);

      expect(grid[0]).toBe(min);
      expect(grid[grid.length - 1]).toBe(max);
      expect(grid.every((weight) => weight % 10 === 0)).toBeTrue();
    });
  }

  describe('the engine fallback', () => {
    let engine: CalculatorService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: PrefsStorage, useValue: new FakePrefsStorage() },
        ],
      });
      engine = TestBed.inject(CalculatorService);
    });

    // Through the engine's own interface: which of its steps settles the ball
    // weight is not this net's business.
    const weightOf = (pizzaType: PizzaType, pizzaWeight: number | null) =>
      engine.process({ ...FACTORY_DEFAULTS, pizzaType, pizzaWeight }).pizzaBalls
        .weight;

    it('keeps the historic values while reading them from the model', () => {
      expect(weightOf(PizzaType.NEAPOLITAN, null)).toBe(250);
      expect(weightOf(PizzaType.ROMAN, null)).toBe(180);
      expect(weightOf(PizzaType.NEAPOLITAN, null)).toBe(
        fallbackWeight(PizzaType.NEAPOLITAN),
      );
      expect(weightOf(PizzaType.ROMAN, null)).toBe(
        fallbackWeight(PizzaType.ROMAN),
      );
    });

    it('brings an explicit weight from outside the style back to its bound', () => {
      // What a Draft or a Dough saved before the bounds existed still holds.
      expect(weightOf(PizzaType.ROMAN, 400)).toBe(210);
      expect(weightOf(PizzaType.NEAPOLITAN, 400)).toBe(340);
      expect(weightOf(PizzaType.NEAPOLITAN, 250)).toBe(250);
    });
  });

  it('seeds the factory Default with the fallback of its own style', () => {
    expect(FACTORY_DEFAULTS.pizzaWeight).toBe(
      fallbackWeight(FACTORY_DEFAULTS.pizzaType),
    );
    expect(FACTORY_DEFAULTS.pizzaWeight).toBe(250);
  });

  describe('every suggested Dough of the Recipe catalog', () => {
    for (const { id, input } of SUGGESTED_DOUGHS) {
      it(`describes a pizza the ${input.pizzaType} style allows: ${id}`, () => {
        const weight = input.pizzaWeight!;

        expect(clampWeight(input.pizzaType, weight)).toBe(weight);
        // A weight the model can produce — i.e. declared as a size, not typed.
        expect(
          weightForSize(
            input.pizzaType,
            sizeForWeight(input.pizzaType, weight),
          ),
        ).toBe(weight);
      });
    }

    it('aims the Roman at the largest pizza its style still describes', () => {
      const roman = SUGGESTED_DOUGHS.find(
        ({ input }) => input.pizzaType === PizzaType.ROMAN,
      );

      expect(roman?.input.pizzaWeight).toBe(210);
      expect(sizeForWeight(PizzaType.ROMAN, roman!.input.pizzaWeight!)).toBe(
        33,
      );
    });

    it('leaves both Neapolitan presets at their historic 250 g', () => {
      const neapolitans = SUGGESTED_DOUGHS.filter(
        ({ input }) => input.pizzaType === PizzaType.NEAPOLITAN,
      );

      expect(neapolitans.length).toBe(2);
      for (const { input } of neapolitans) {
        expect(input.pizzaWeight).toBe(250);
      }
    });
  });
});
