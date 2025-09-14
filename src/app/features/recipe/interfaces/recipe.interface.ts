import { LucideIconData } from 'lucide-angular';

export interface IRecipeHelper {
  title: string;
  descriptions: string[];
}

export interface IRecipeIngredientItem {
  icon: LucideIconData;
  value: number;
  title: string;
  unit: string;
  numberFormat?: string;
  description?: string;
}

export interface IRecipeMethodItem {
  icon: LucideIconData;
  title: string;
  helper?: IRecipeHelper;
  variables?: {
    [key: string]: number | string | undefined;
  };
}

export interface IRecipe {
  title: string;
  ingredients: {
    items: IRecipeIngredientItem[];
  };
  method: {
    items: IRecipeMethodItem[];
  };
}
