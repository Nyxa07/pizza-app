import { DoughType } from '../calculator/enums/dough-type.enum';
import { YeastType } from '../calculator/enums/yeast-type.enum';
import { PizzaType } from '../settings/enums/pizza-type.enum';
import type {
  PizzaRecipeDefinition,
  SuggestedDough,
} from './interfaces/pizza-recipe.interface';

/**
 * Curated dough presets referenced by Recipes. They are complete Drafts so
 * the hand-off to Expert never depends on the user's Defaults.
 *
 * Each entry is named after what it *is* — style, method, rest, hydration —
 * never after the Recipe consuming it, so two Recipes can share a preset or
 * diverge on hydration alone without renaming anything. A `globalRestTime` of
 * 24 h on a direct dough resolves to 24 ambient hours and no cold rest.
 */
export const SUGGESTED_DOUGHS = [
  {
    id: 'neapolitan-direct-24h-62',
    input: {
      nbPizzas: 4,
      doughType: DoughType.DIRECT,
      yeastType: YeastType.DRY_INSTANT,
      hydrationRatio: 0.62,
      temperature: 20,
      globalRestTime: 24,
      rtRestTime: null,
      coldRestTime: null,
      poolishRatio: 0.4,
      flourStrength: 270,
      saltRatio: 0.028,
      honeyRatio: 0,
      pizzaWeight: 250,
      pizzaType: PizzaType.NEAPOLITAN,
      oliveOilRatio: 0,
    },
  },
  {
    // A cheeseless topping carries — and deserves — a wetter dough.
    id: 'neapolitan-direct-24h-66',
    input: {
      nbPizzas: 4,
      doughType: DoughType.DIRECT,
      yeastType: YeastType.DRY_INSTANT,
      hydrationRatio: 0.66,
      temperature: 20,
      globalRestTime: 24,
      rtRestTime: null,
      coldRestTime: null,
      poolishRatio: 0.4,
      flourStrength: 270,
      saltRatio: 0.028,
      honeyRatio: 0,
      pizzaWeight: 250,
      pizzaType: PizzaType.NEAPOLITAN,
      oliveOilRatio: 0,
    },
  },
  {
    id: 'roman-direct-24h-55',
    input: {
      nbPizzas: 4,
      doughType: DoughType.DIRECT,
      yeastType: YeastType.DRY_INSTANT,
      hydrationRatio: 0.55,
      temperature: 20,
      globalRestTime: 24,
      rtRestTime: null,
      coldRestTime: null,
      poolishRatio: 0.4,
      flourStrength: 270,
      saltRatio: 0.026,
      honeyRatio: 0,
      pizzaWeight: 260,
      pizzaType: PizzaType.ROMAN,
      oliveOilRatio: 0.02,
    },
  },
] satisfies readonly SuggestedDough[];

/**
 * Adding a Recipe only extends this data and the matching FR/EN JSON entries.
 * Pages and services discover every entry by iteration; there is no registry
 * or route to edit elsewhere.
 */
export const PIZZA_RECIPE_CATALOG = [
  {
    id: 'margherita',
    image: {
      path: 'assets/recipes/margherita.webp',
      sourceUrl: 'https://www.pexels.com/photo/top-view-of-pizza-19260786/',
      photographer: 'Giona Mason',
    },
    suggestedDoughId: 'neapolitan-direct-24h-62',
  },
  {
    id: 'marinara',
    image: {
      path: 'assets/recipes/marinara.webp',
      sourceUrl:
        'https://www.pexels.com/photo/authentic-artisan-pizza-on-rustic-wooden-table-34775818/',
      photographer: 'Rene Strgar',
    },
    suggestedDoughId: 'neapolitan-direct-24h-66',
  },
  {
    id: 'reine',
    image: {
      path: 'assets/recipes/reine.webp',
      sourceUrl:
        'https://www.pexels.com/photo/pizza-with-ham-and-mushroom-toppings-12288354/',
      photographer: 'Nadin Sh',
    },
    suggestedDoughId: 'roman-direct-24h-55',
  },
] satisfies readonly PizzaRecipeDefinition[];
