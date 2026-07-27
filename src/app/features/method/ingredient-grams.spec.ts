import {
  ingredientGramsFormat,
  roundIngredientGrams,
} from './ingredient-grams';

describe('ingredient grams', () => {
  describe('roundIngredientGrams', () => {
    it('reads flour, water, salt and the extras off the scale to the gram', () => {
      expect(roundIngredientGrams('flour', 302.4)).toBe(302);
      expect(roundIngredientGrams('water', 301.5)).toBe(302);
      expect(roundIngredientGrams('salt', 20.6)).toBe(21);
      expect(roundIngredientGrams('honey', 3.02)).toBe(3);
      expect(roundIngredientGrams('oliveOil', 12.2)).toBe(12);
    });

    it('weighs the yeast at the centigram', () => {
      expect(roundIngredientGrams('yeast', 0.8371)).toBe(0.84);
      expect(roundIngredientGrams('yeast', 2.1449)).toBe(2.14);
      expect(roundIngredientGrams('yeast', 3)).toBe(3);
    });

    it('never rounds a real pinch of yeast down to nothing', () => {
      expect(roundIngredientGrams('yeast', 0.004)).toBe(0.01);
    });

    it('leaves an absent yeast absent', () => {
      expect(roundIngredientGrams('yeast', 0)).toBe(0);
    });
  });

  describe('ingredientGramsFormat', () => {
    it('shows the yeast with its two decimals, always', () => {
      expect(ingredientGramsFormat('yeast')).toBe('1.2-2');
    });

    it('shows every other ingredient as a whole gram', () => {
      expect(ingredientGramsFormat('flour')).toBe('1.0-0');
      expect(ingredientGramsFormat('water')).toBe('1.0-0');
      expect(ingredientGramsFormat('salt')).toBe('1.0-0');
      expect(ingredientGramsFormat('honey')).toBe('1.0-0');
      expect(ingredientGramsFormat('oliveOil')).toBe('1.0-0');
    });
  });
});
