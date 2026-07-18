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
 */
export const SUGGESTED_DOUGHS = [
  {
    id: 'neapolitan-direct-24h',
    input: {
      nbPizzas: 4,
      doughType: DoughType.DIRECT,
      yeastType: YeastType.DRY_INSTANT,
      hydrationRatio: 0.63,
      temperature: 20,
      globalRestTime: 24,
      rtRestTime: null,
      coldRestTime: null,
      poolishRatio: 0.4,
      flourStrength: 280,
      saltRatio: 0.028,
      honeyRatio: 0,
      pizzaWeight: 250,
      pizzaType: PizzaType.NEAPOLITAN,
      oliveOilRatio: 0,
    },
  },
  {
    id: 'crisp-direct-24h',
    input: {
      nbPizzas: 4,
      doughType: DoughType.DIRECT,
      yeastType: YeastType.DRY_INSTANT,
      hydrationRatio: 0.6,
      temperature: 20,
      globalRestTime: 24,
      rtRestTime: null,
      coldRestTime: null,
      poolishRatio: 0.4,
      flourStrength: 260,
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
    suggestedDoughId: 'neapolitan-direct-24h',
  },
  {
    id: 'marinara',
    image: {
      path: 'assets/recipes/marinara.webp',
      sourceUrl:
        'https://www.pexels.com/photo/authentic-artisan-pizza-on-rustic-wooden-table-34775818/',
      photographer: 'Rene Strgar',
    },
    suggestedDoughId: 'neapolitan-direct-24h',
  },
  {
    id: 'reine',
    image: {
      path: 'assets/recipes/reine.webp',
      sourceUrl:
        'https://www.pexels.com/photo/pizza-with-ham-and-mushroom-toppings-12288354/',
      photographer: 'Nadin Sh',
    },
    suggestedDoughId: 'crisp-direct-24h',
  },
] satisfies readonly PizzaRecipeDefinition[];
