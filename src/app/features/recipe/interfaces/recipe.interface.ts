import { LucideIconData } from 'lucide-angular';

export interface IRecipeHelper {
  title: string;
  description: string;
}

export interface IRecipeItem {
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
  description?: string;
  helper?: IRecipeHelper;
}

export interface IRecipe {
  ingredients: {
    title: string;
    items: IRecipeItem[];
  };
  method: {
    title: string;
    items: IRecipeMethodItem[];
  };
}
