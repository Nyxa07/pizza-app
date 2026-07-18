import { TestBed } from '@angular/core/testing';

import { provideTranslateService } from '@ngx-translate/core';

import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { collectKeys } from 'src/app/shared/testing/collect-keys';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';
import enRecipes from 'src/assets/i18n/en/recipes.json';
import frRecipes from 'src/assets/i18n/fr/recipes.json';

import type {
  PizzaRecipeContent,
  PizzaRecipeTranslations,
} from '../interfaces/pizza-recipe.interface';
import { PIZZA_RECIPE_CATALOG, SUGGESTED_DOUGHS } from '../recipes.catalog';
import { RecipeCatalogService } from './recipe-catalog.service';

describe('Recipe catalog integrity', () => {
  const ids = PIZZA_RECIPE_CATALOG.map(({ id }) => id);
  const translations: {
    name: string;
    catalog: PizzaRecipeTranslations;
  }[] = [
    { name: 'fr', catalog: frRecipes },
    { name: 'en', catalog: enRecipes },
  ];

  it('ships unique definitions with a valid suggested dough and visual', () => {
    expect(new Set(ids).size).toBe(ids.length);

    for (const recipe of PIZZA_RECIPE_CATALOG) {
      expect(recipe.id.trim().length).toBeGreaterThan(0);
      expect(recipe.image.path).toMatch(/^assets\/recipes\/.+\.webp$/);
      expect(recipe.image.sourceUrl).toMatch(
        /^https:\/\/www\.pexels\.com\/photo\//,
      );
      expect(recipe.image.photographer.trim().length).toBeGreaterThan(0);
      expect(
        SUGGESTED_DOUGHS.some(
          (suggestion) => suggestion.id === recipe.suggestedDoughId,
        ),
      ).toBeTrue();
    }
  });

  for (const { name, catalog } of translations) {
    it(`ships complete content for every Recipe in "${name}"`, () => {
      expect(Object.keys(catalog).sort()).toEqual([...ids].sort());

      for (const id of ids) {
        const content: PizzaRecipeContent = catalog[id];
        const textFields = [
          content.name,
          content.category,
          content.summary,
          content.description,
          content.imageAlt,
          content.doughSuggestion,
        ];

        for (const text of [
          ...textFields,
          ...content.ingredients,
          ...content.steps,
        ]) {
          expect(text.trim()).toBe(text);
          expect(text.length).toBeGreaterThan(0);
        }
        expect(content.ingredients.length).toBeGreaterThan(0);
        expect(content.steps.length).toBeGreaterThan(0);
      }
    });
  }

  it('ships the same content structure in French and English', () => {
    expect(collectKeys(frRecipes).sort()).toEqual(
      collectKeys(enRecipes).sort(),
    );
  });
});

describe('RecipeCatalogService', () => {
  let prefs: FakePrefsStorage;
  let service: RecipeCatalogService;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: prefs },
      ],
    });
    service = TestBed.inject(RecipeCatalogService);
  });

  it('serves the whole catalog in the persisted locale', () => {
    prefs.set('locale:current', 'fr');

    expect(service.list().map((recipe) => recipe.content.name)).toEqual([
      'Margherita',
      'Marinara',
      'Reine',
    ]);
    expect(service.get('marinara')?.content.category).toBe(
      'La plus dépouillée',
    );
  });

  it('falls back to English for a locale that is not shipped', () => {
    prefs.set('locale:current', 'de');

    expect(service.get('reine')?.content.category).toBe('The French classic');
  });

  it('explicitly replaces the Draft with the detached suggested dough', () => {
    const state = TestBed.inject(CalculatorStateService);
    state.update({ nbPizzas: 9, hydrationRatio: 0.8 });
    prefs.set('calculator:guided:step', 5);

    expect(service.prepareSuggestedDough('margherita')).toBeTrue();
    expect(state.getInput().nbPizzas).toBe(4);
    expect(state.getInput().hydrationRatio).toBe(0.63);
    expect(prefs.get('calculator:guided:step')).toBeNull();
    expect(prefs.get('calculator:draft')).toEqual(state.getInput());
  });

  it('leaves the Draft untouched for an unknown Recipe', () => {
    const state = TestBed.inject(CalculatorStateService);
    state.update({ nbPizzas: 7 });

    expect(service.prepareSuggestedDough('missing')).toBeFalse();
    expect(state.getInput().nbPizzas).toBe(7);
  });
});
