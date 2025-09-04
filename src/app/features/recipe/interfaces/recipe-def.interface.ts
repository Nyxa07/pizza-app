export interface IRecipeDef {
  baseTranslationKey: string;
  ingredients: {
    items: {
      icon: any;
      value: number;
      label: string;
      unit: string;
    }[];
  };
  method: {
    variables: Record<string, any>;
    items: {
      icon: any;
      helperDescriptions: number;
      variables?: Record<string, any>;
      hide?: boolean;
    }[];
  };
}
