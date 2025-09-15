export interface IRecipeDef {
  title: string;
  description?: string;
  ingredients: {
    items: {
      icon: any;
      value: number;
      title: string;
      unit: string;
      numberFormat?: string;
    }[];
  };
  method: {
    variables: Record<string, any>;
    items: {
      icon: any;
      helperDescriptions: number;
      variables?: Record<string, any>;
      hide?: boolean;
      baseTranslationKey: string;
    }[];
  };
}
