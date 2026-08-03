import { TestBed } from '@angular/core/testing';

import { provideTranslateService } from '@ngx-translate/core';

import { DoughType } from 'src/app/features/calculator/enums/dough-type.enum';
import { GUIDED_DRAFT_STORAGE_KEY } from 'src/app/features/calculator/paths/calculator-draft-storage.constants';
import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { CalculatorPaths } from 'src/app/features/calculator/paths/calculator-paths.service';
import { DoughFacts } from 'src/app/features/calculator/facts/dough-facts.service';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
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

describe('The dough each Recipe recommends', () => {
  /**
   * The house recommendation per Recipe, as the user reads it: the style and
   * method carried by the preset, plus the hydration and the rest split the
   * engine resolves. A silent preset edit fails here, not in production.
   */
  const HOUSE_DOUGH_FACTS = [
    {
      id: 'margherita',
      pizzaType: PizzaType.NEAPOLITAN,
      doughType: DoughType.DIRECT,
      hydrationRatio: 0.62,
      flourStrength: 270,
      balls: 4,
      ballWeight: 250,
      ambientHours: 24,
      coldHours: 0,
    },
    {
      id: 'marinara',
      pizzaType: PizzaType.NEAPOLITAN,
      doughType: DoughType.DIRECT,
      hydrationRatio: 0.66,
      flourStrength: 270,
      balls: 4,
      ballWeight: 250,
      ambientHours: 24,
      coldHours: 0,
    },
    {
      // Dressed out of the oven, so it asks for the same dough as the Marinara.
      id: 'marinara-garnie',
      pizzaType: PizzaType.NEAPOLITAN,
      doughType: DoughType.DIRECT,
      hydrationRatio: 0.66,
      flourStrength: 270,
      balls: 4,
      ballWeight: 250,
      ambientHours: 24,
      coldHours: 0,
    },
    {
      id: 'reine',
      pizzaType: PizzaType.ROMAN,
      doughType: DoughType.DIRECT,
      hydrationRatio: 0.55,
      flourStrength: 270,
      balls: 4,
      // The largest pizza the Roman style still describes: 33 cm (issue #99).
      // The former 260 g amounted to a 37 cm pizza, outside the style.
      ballWeight: 210,
      ambientHours: 24,
      coldHours: 0,
    },
    {
      id: 'quatre-fromages',
      pizzaType: PizzaType.NEAPOLITAN,
      doughType: DoughType.DIRECT,
      hydrationRatio: 0.62,
      flourStrength: 270,
      balls: 4,
      ballWeight: 250,
      ambientHours: 24,
      coldHours: 0,
    },
    {
      // The heaviest cheese load of the notebook, so the drier of the two
      // Neapolitans, exactly like the four-cheese one.
      id: 'la-regalade',
      pizzaType: PizzaType.NEAPOLITAN,
      doughType: DoughType.DIRECT,
      hydrationRatio: 0.62,
      flourStrength: 270,
      balls: 4,
      ballWeight: 250,
      ambientHours: 24,
      coldHours: 0,
    },
  ] as const;

  let catalog: RecipeCatalogService;
  let doughFacts: DoughFacts;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    });
    catalog = TestBed.inject(RecipeCatalogService);
    doughFacts = TestBed.inject(DoughFacts);
  });

  it('covers every shipped Recipe', () => {
    expect(PIZZA_RECIPE_CATALOG.map(({ id }) => id)).toEqual(
      HOUSE_DOUGH_FACTS.map(({ id }) => id),
    );
  });

  for (const expected of HOUSE_DOUGH_FACTS) {
    it(`resolves the house dough facts of "${expected.id}"`, () => {
      const recipe = catalog.get(expected.id);
      if (!recipe) {
        throw new Error(`Missing Recipe: ${expected.id}`);
      }
      const { input } = recipe.suggestedDough;

      // The style and the flour are carried by the preset, not resolved.
      expect(input.pizzaType).toBe(expected.pizzaType);
      expect(input.flourStrength).toBe(expected.flourStrength);

      const facts = doughFacts.factsOf(input);
      expect(facts.doughType).toBe(expected.doughType);
      expect(facts.hydrationRatio).toBe(expected.hydrationRatio);
      expect(facts.balls).toBe(expected.balls);
      expect(facts.ballWeight).toBe(expected.ballWeight);
      expect(facts.ambientHours).toBe(expected.ambientHours);
      expect(facts.coldHours).toBe(expected.coldHours);
    });
  }
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
      'Marinara garnie',
      'Reine',
      '4 fromages',
      'La Régalade',
    ]);
    expect(service.get('marinara')?.content.category).toBe(
      'La plus dépouillée',
    );
  });

  it('falls back to English for a locale that is not shipped', () => {
    prefs.set('locale:current', 'de');

    expect(service.get('reine')?.content.category).toBe('The French classic');
  });

  it('explicitly starts a calculation from the detached suggested dough', () => {
    const state = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);
    state.update({ nbPizzas: 9, hydrationRatio: 0.8 });
    prefs.set('calculator:guided:step', 5);
    prefs.set(GUIDED_DRAFT_STORAGE_KEY, { nbPizzas: 6 });

    expect(service.prepareSuggestedDough('margherita')).toBeTrue();
    expect(state.snapshot().nbPizzas).toBe(4);
    expect(state.snapshot().hydrationRatio).toBe(0.62);
    expect(prefs.get('calculator:guided:step')).toBe(5);
    expect(prefs.get(GUIDED_DRAFT_STORAGE_KEY)).toEqual({ nbPizzas: 6 });
    expect(prefs.get('calculator:draft:expert')).toEqual(state.snapshot());
  });

  it('leaves the Draft untouched for an unknown Recipe', () => {
    const state = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);
    state.update({ nbPizzas: 7 });

    expect(service.prepareSuggestedDough('missing')).toBeFalse();
    expect(state.snapshot().nbPizzas).toBe(7);
  });
});
