export class TranslationKeys {
  static getPluralizationKey(key: string, isPlural: boolean = false) {
    return isPlural ? `${key}.plural` : `${key}.singular`;
  }

  // Dough routes index
  static readonly DOUGH_ROUTES = {
    TITLE: 'app.routes.dough.index.title',
    SEGMENTS: {
      CALCULATOR: 'app.routes.dough.index.segments.calculator',
      RECIPE: 'app.routes.dough.index.segments.recipe',
    },
    CALCULATOR: {
      TITLE: 'app.routes.dough.index.calculator.title',
      SUBTITLE: 'app.routes.dough.index.calculator.subtitle',
    },
    INGREDIENTS: {
      TITLE: 'app.routes.dough.index.ingredients.title',
      SUBTITLE: 'app.routes.dough.index.ingredients.subtitle',
    },
  };

  static readonly FAQ_ROUTES = {
    TITLE: 'app.routes.faq.index.title',
  };

  // Settings routes index
  static readonly SETTINGS_ROUTES = {
    TITLE: 'app.routes.settings.index.title',
  };

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
      DIRECT: {
        TITLE: 'app.pizza.recipe.direct.title',
        SUBTITLE: 'app.pizza.recipe.direct.subtitle',
        STEP_1_DESCRIPTION: 'app.pizza.recipe.direct.step1Description',
        STEP_2_DESCRIPTION: 'app.pizza.recipe.direct.step2Description',
        STEP_3_DESCRIPTION: 'app.pizza.recipe.direct.step3Description',
        STEP_4_DESCRIPTION: 'app.pizza.recipe.direct.step4Description',
        STEP_5_DESCRIPTION: 'app.pizza.recipe.direct.step5Description',
        STEP_6_DESCRIPTION: 'app.pizza.recipe.direct.step6Description',
        STEP_7_DESCRIPTION: 'app.pizza.recipe.direct.step7Description',
        STEP_8_DESCRIPTION: 'app.pizza.recipe.direct.step8Description',
        STEP_9_DESCRIPTION: 'app.pizza.recipe.direct.step9Description',
        STEP_10_DESCRIPTION: 'app.pizza.recipe.direct.step10Description',
        STEP_11_DESCRIPTION: 'app.pizza.recipe.direct.step11Description',
      },
      POOLISH: {
        POOLISH: {
          TITLE: 'app.pizza.recipe.poolish.poolish.title',
          SUBTITLE: 'app.pizza.recipe.poolish.poolish.subtitle',
          STEP_1_DESCRIPTION:
            'app.pizza.recipe.poolish.poolish.step1Description',
          INGREDIENTS_LIST: 'app.pizza.recipe.poolish.poolish.ingredientsList',
          STEP_2_DESCRIPTION:
            'app.pizza.recipe.poolish.poolish.step2Description',
          STEP_3_DESCRIPTION:
            'app.pizza.recipe.poolish.poolish.step3Description',
        },
        DOUGH: {
          TITLE: 'app.pizza.recipe.poolish.dough.title',
          SUBTITLE: 'app.pizza.recipe.poolish.dough.subtitle',
          STEP_1_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step1Description',
          STEP_2_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step2Description',
          INGREDIENTS_LIST: 'app.pizza.recipe.poolish.dough.ingredientsList',
          STEP_3_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step3Description',
          STEP_4_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step4Description',
          STEP_5_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step5Description',
          STEP_6_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step6Description',
          STEP_7_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step7Description',
          STEP_8_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step8Description',
          STEP_9_DESCRIPTION: 'app.pizza.recipe.poolish.dough.step9Description',
          STEP_10_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step10Description',
          STEP_11_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step11Description',
          STEP_12_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step12Description',
          STEP_13_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step13Description',
          STEP_14_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step14Description',
          STEP_15_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step15Description',
          STEP_16_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step16Description',
          STEP_17_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step17Description',
          STEP_18_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step18Description',
          STEP_19_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step19Description',
          STEP_20_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step20Description',
          STEP_21_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step21Description',
          STEP_22_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step22Description',
          STEP_23_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step23Description',
          STEP_24_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step24Description',
          STEP_25_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step25Description',
          STEP_26_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step26Description',
          STEP_27_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step27Description',
          STEP_28_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step28Description',
          STEP_29_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step29Description',
          STEP_30_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step30Description',
          STEP_31_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step31Description',
          STEP_32_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step32Description',
          STEP_33_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step33Description',
          STEP_34_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step34Description',
          STEP_35_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step35Description',
          STEP_36_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step36Description',
          STEP_37_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step37Description',
          STEP_38_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step38Description',
          STEP_39_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step39Description',
          STEP_40_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step40Description',
          STEP_41_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step41Description',
          STEP_42_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step42Description',
          STEP_43_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step43Description',
          STEP_44_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step44Description',
          STEP_45_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step45Description',
          STEP_46_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step46Description',
          STEP_47_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step47Description',
          STEP_48_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step48Description',
          STEP_49_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step49Description',
          STEP_50_DESCRIPTION:
            'app.pizza.recipe.poolish.dough.step50Description',
          TIPS_TITLE: 'app.pizza.recipe.poolish.dough.tipsTitle',
          TIPS_DESCRIPTION: 'app.pizza.recipe.poolish.dough.tipsDescription',
          SUCCESS_MESSAGE: 'app.pizza.recipe.poolish.dough.successMessage',
        },
      },

      STORAGE: {
        TITLE: 'app.pizza.recipe.storage.title',
        SUBTITLE: 'app.pizza.recipe.storage.subtitle',
        REFRIGERATOR: 'app.pizza.recipe.storage.refrigerator',
        FREEZER: 'app.pizza.recipe.storage.freezer',
      },
    },
  };

  // Language selector translations
  static readonly LANGUAGE = {
    SELECTOR: {
      TITLE: 'app.language.selector.title',
      EN: 'app.language.selector.en',
      FR: 'app.language.selector.fr',
      IT: 'app.language.selector.it',
      ES: 'app.language.selector.es',
      DE: 'app.language.selector.de',
    },
  };

  static readonly FAQ = {
    QUESTIONS: [
      {
        TITLE: 'app.faq.questions.0.title',
        SUBTITLE: 'app.faq.questions.0.subtitle',
        ANSWERS: [
          'app.faq.questions.0.answers.0',
          'app.faq.questions.0.answers.1',
        ],
      },
      {
        TITLE: 'app.faq.questions.1.title',
        SUBTITLE: 'app.faq.questions.1.subtitle',
        ANSWERS: [
          'app.faq.questions.1.answers.0',
          'app.faq.questions.1.answers.1',
          'app.faq.questions.1.answers.2',
        ],
      },
      {
        TITLE: 'app.faq.questions.2.title',
        SUBTITLE: 'app.faq.questions.2.subtitle',
        ANSWERS: [
          'app.faq.questions.2.answers.0',
          'app.faq.questions.2.answers.1',
        ],
      },
      {
        TITLE: 'app.faq.questions.3.title',
        SUBTITLE: 'app.faq.questions.3.subtitle',
        ANSWERS: [
          'app.faq.questions.3.answers.0',
          'app.faq.questions.3.answers.1',
          'app.faq.questions.3.answers.2',
        ],
        TIPS: [
          {
            TITLE: 'app.faq.questions.3.tips.0.title',
            DESCRIPTION: 'app.faq.questions.3.tips.0.description',
          },
        ],
      },
      {
        TITLE: 'app.faq.questions.4.title',
        SUBTITLE: 'app.faq.questions.4.subtitle',
        ANSWERS: [
          'app.faq.questions.4.answers.0',
          'app.faq.questions.4.answers.1',
        ],
        TIPS: [
          {
            TITLE: 'app.faq.questions.4.tips.0.title',
            DESCRIPTION: 'app.faq.questions.4.tips.0.description',
          },
        ],
      },
      {
        TITLE: 'app.faq.questions.5.title',
        SUBTITLE: 'app.faq.questions.5.subtitle',
        ANSWERS: [
          'app.faq.questions.5.answers.0',
          'app.faq.questions.5.answers.1',
        ],
        TIPS: [
          {
            TITLE: 'app.faq.questions.5.tips.0.title',
            DESCRIPTION: 'app.faq.questions.5.tips.0.description',
          },
        ],
      },
      {
        TITLE: 'app.faq.questions.6.title',
        SUBTITLE: 'app.faq.questions.6.subtitle',
        ANSWERS: [
          'app.faq.questions.6.answers.0',
          'app.faq.questions.6.answers.1',
        ],
      },
      {
        TITLE: 'app.faq.questions.7.title',
        SUBTITLE: 'app.faq.questions.7.subtitle',
        ANSWERS: ['app.faq.questions.7.answers.0'],
      },
      {
        TITLE: 'app.faq.questions.8.title',
        SUBTITLE: 'app.faq.questions.8.subtitle',
        ANSWERS: ['app.faq.questions.8.answers.0'],
      },
    ],
  };
}
