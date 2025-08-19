import { LucideIconData } from 'lucide-angular';

export interface IRecipeHelper {
  title: string;
  descriptions: string[];
}

export interface IRecipeIngredientItem {
  icon: LucideIconData;
  value: number;
  label: string;
  unit: string;
  numberFormat?: string;
  description?: string;
}

export interface IRecipeMethodItem {
  icon: LucideIconData;
  label: string;
  helper?: IRecipeHelper;
  variables?: {
    [key: string]: number | string | undefined;
  };
}

export interface IRecipe {
  ingredients: {
    title: string;
    items: IRecipeIngredientItem[];
  };
  method: {
    title: string;
    items: IRecipeMethodItem[];
  };
}
