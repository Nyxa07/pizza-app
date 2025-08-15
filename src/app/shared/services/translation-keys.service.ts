export class TranslationKeys {
  static getPluralizationKey(key: string, isPlural: boolean = false) {
    return isPlural ? `${key}.plural` : `${key}.singular`;
  }

  // Common translations
  static readonly COMMON = {
    ACTIONS: {
      SAVE: 'app.common.actions.save',
      CANCEL: 'app.common.actions.cancel',
      DELETE: 'app.common.actions.delete',
      EDIT: 'app.common.actions.edit',
      ADD: 'app.common.actions.add',
      OK: 'app.common.actions.ok',
    },
    STATUS: {
      LOADING: 'app.common.status.loading',
      ERROR: 'app.common.status.error',
      SUCCESS: 'app.common.status.success',
      WARNING: 'app.common.status.warning',
    },
    NAVIGATION: {
      BACK: 'app.common.navigation.back',
      NEXT: 'app.common.navigation.next',
      PREVIOUS: 'app.common.navigation.previous',
    },
  };

  // Pizza-related translations
  static readonly PIZZA = {
    FORM: {
      PIZZAS_NUMBER: 'app.pizza.form.pizzasNumber',
      DOUGH_TYPE: 'app.pizza.form.doughType',
      YEAST_TYPE: 'app.pizza.form.yeastType',
      HYDRATION: 'app.pizza.form.hydration',
      TEMPERATURE: 'app.pizza.form.temperature',
      POOLISH_RATIO: 'app.pizza.form.poolishRatio',
      RT_REST_TIME: 'app.pizza.form.rtRestTime',
      COLD_REST_TIME: 'app.pizza.form.coldRestTime',
      REST_TIME_UNIT: 'app.pizza.form.restTimeUnit',
    },
    INGREDIENTS: {
      FLOUR: 'app.pizza.ingredients.flour',
      WATER: 'app.pizza.ingredients.water',
      YEAST: 'app.pizza.ingredients.yeast',
      HONEY: 'app.pizza.ingredients.honey',
      SALT: 'app.pizza.ingredients.salt',
      DRY_ACTIVE_YEAST: 'app.pizza.ingredients.dryActiveYeast',
      DRY_INSTANT_YEAST: 'app.pizza.ingredients.dryInstantYeast',
      FRESH_YEAST: 'app.pizza.ingredients.freshYeast',
    },
    CALCULATIONS: {
      INGREDIENTS: 'app.pizza.calculations.ingredients',
      TOTAL: 'app.pizza.calculations.total',
      POOLISH: 'app.pizza.calculations.poolish',
      DOUGH: 'app.pizza.calculations.dough',
      WEIGHT: 'app.pizza.calculations.weight',
      PERCENTAGE: 'app.pizza.calculations.percentage',
    },
    DOUGH_TYPES: {
      POOLISH: 'app.pizza.doughTypes.poolish',
      DIRECT: 'app.pizza.doughTypes.direct',
    },
    RECIPE: {
      QUANTITY: {
        FLOUR: 'app.pizza.recipe.quantity.flour',
        WATER: 'app.pizza.recipe.quantity.water',
        YEAST: 'app.pizza.recipe.quantity.yeast',
        HONEY: 'app.pizza.recipe.quantity.honey',
        SALT: 'app.pizza.recipe.quantity.salt',
      },
      POOLISH_PREPARATION: {
        TITLE: 'app.pizza.recipe.poolishPreparation.title',
        SUBTITLE: 'app.pizza.recipe.poolishPreparation.subtitle',
        STEP_1_DESCRIPTION:
          'app.pizza.recipe.poolishPreparation.step1Description',
        INGREDIENTS_LIST: 'app.pizza.recipe.poolishPreparation.ingredientsList',
        STEP_2_DESCRIPTION:
          'app.pizza.recipe.poolishPreparation.step2Description',
        STEP_3_DESCRIPTION:
          'app.pizza.recipe.poolishPreparation.step3Description',
      },
      DOUGH_PREPARATION: {
        TITLE: 'app.pizza.recipe.doughPreparation.title',
        SUBTITLE: 'app.pizza.recipe.doughPreparation.subtitle',
        STEP_1_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step1Description',
        STEP_2_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step2Description',
        INGREDIENTS_LIST: 'app.pizza.recipe.doughPreparation.ingredientsList',
        STEP_3_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step3Description',
        STEP_4_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step4Description',
        STEP_5_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step5Description',
        STEP_6_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step6Description',
        STEP_7_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step7Description',
        STEP_8_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step8Description',
        STEP_9_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step9Description',
        STEP_10_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step10Description',
        STEP_11_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step11Description',
        STEP_12_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step12Description',
        STEP_13_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step13Description',
        STEP_14_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step14Description',
        STEP_15_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step15Description',
        STEP_16_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step16Description',
        STEP_17_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step17Description',
        STEP_18_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step18Description',
        STEP_19_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step19Description',
        STEP_20_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step20Description',
        STEP_21_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step21Description',
        STEP_22_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step22Description',
        STEP_23_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step23Description',
        STEP_24_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step24Description',
        STEP_25_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step25Description',
        STEP_26_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step26Description',
        STEP_27_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step27Description',
        STEP_28_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step28Description',
        STEP_29_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step29Description',
        STEP_30_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step30Description',
        STEP_31_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step31Description',
        STEP_32_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step32Description',
        STEP_33_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step33Description',
        STEP_34_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step34Description',
        STEP_35_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step35Description',
        STEP_36_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step36Description',
        STEP_37_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step37Description',
        STEP_38_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step38Description',
        STEP_39_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step39Description',
        STEP_40_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step40Description',
        STEP_41_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step41Description',
        STEP_42_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step42Description',
        STEP_43_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step43Description',
        STEP_44_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step44Description',
        STEP_45_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step45Description',
        STEP_46_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step46Description',
        STEP_47_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step47Description',
        STEP_48_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step48Description',
        STEP_49_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step49Description',
        STEP_50_DESCRIPTION:
          'app.pizza.recipe.doughPreparation.step50Description',
        TIPS_TITLE: 'app.pizza.recipe.doughPreparation.tipsTitle',
        TIPS_DESCRIPTION: 'app.pizza.recipe.doughPreparation.tipsDescription',
        SUCCESS_MESSAGE: 'app.pizza.recipe.doughPreparation.successMessage',
      },
      STORAGE: {
        TITLE: 'app.pizza.recipe.storage.title',
        SUBTITLE: 'app.pizza.recipe.storage.subtitle',
        REFRIGERATOR: 'app.pizza.recipe.storage.refrigerator',
        FREEZER: 'app.pizza.recipe.storage.freezer',
      },
    },
  };

  // Navigation translations
  static readonly NAVIGATION = {
    TABS: {
      POOLISH_STYLE: 'app.navigation.tabs.poolishStyle',
      TAB2: 'app.navigation.tabs.tab2',
      TAB3: 'app.navigation.tabs.tab3',
    },
    HEADER: {
      TITLE: 'app.navigation.header.title',
      LANGUAGE: 'app.navigation.header.language',
    },
  };

  // Tab1 page translations
  static readonly TAB1 = {
    SEGMENTS: {
      DATA: 'app.tab1.segments.data',
      RECIPE: 'app.tab1.segments.recipe',
    },
    CONFIGURATION: {
      TITLE: 'app.tab1.configuration.title',
      SUBTITLE: 'app.tab1.configuration.subtitle',
    },
    INGREDIENTS: {
      TITLE: 'app.tab1.ingredients.title',
      SUBTITLE: 'app.tab1.ingredients.subtitle',
    },
  };

  // Language selector translations
  static readonly LANGUAGE = {
    SELECTOR: {
      TITLE: 'app.language.selector.title',
      ENGLISH: 'app.language.selector.english',
      FRENCH: 'app.language.selector.french',
      ITALIAN: 'app.language.selector.italian',
      SPANISH: 'app.language.selector.spanish',
      GERMAN: 'app.language.selector.german',
    },
  };

  static readonly FAQ = {
    TITLE: 'app.faq.title',
    QUESTIONS: {
      QUESTION_1: {
        TITLE: 'app.faq.questions.question1.title',
        SUBTITLE: 'app.faq.questions.question1.subtitle',
        ANSWER: {
          PART_1: 'app.faq.questions.question1.answer.part1',
          PART_2: 'app.faq.questions.question1.answer.part2',
        },
      },
      QUESTION_2: {
        TITLE: 'app.faq.questions.question2.title',
        SUBTITLE: 'app.faq.questions.question2.subtitle',
        ANSWER: {
          PART_1: 'app.faq.questions.question2.answer.part1',
          PART_2: 'app.faq.questions.question2.answer.part2',
        },
      },
    },
  };
}
