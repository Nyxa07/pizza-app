export interface IRecipeDef {
  title: string;
  ingredients: {
    items: {
      icon: any;
      value: number;
      title: string;
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
      baseTranslationKey: string;
    }[];
  };
}
