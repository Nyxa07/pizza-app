import { TestBed } from '@angular/core/testing';

import { TranslateService } from '@ngx-translate/core';
import { FlameIcon } from 'lucide-angular';

import type { IMethod } from '../interfaces/method.interface';
import { MethodTextService } from './method-text.service';

describe('MethodTextService', () => {
  let service: MethodTextService;
  let translate: jasmine.SpyObj<TranslateService>;

  const method: IMethod = {
    sections: [
      {
        title: 'calculator.method.titles.poolish',
        ingredients: [
          { key: 'flour', grams: 302 },
          { key: 'yeast', grams: 0.8 },
        ],
      },
    ],
    steps: [
      {
        icon: FlameIcon,
        at: new Date(2026, 6, 16, 2, 0),
        title: 'calculator.method.steps.bake.title',
        variables: {},
        helper: {
          title: 'calculator.method.steps.bake.helper.title',
          descriptions: ['calculator.method.steps.bake.helper.descriptions.0'],
        },
        ingredients: [],
      },
    ],
    startAt: new Date(2026, 6, 14, 21, 0),
    readyAt: new Date(2026, 6, 16, 2, 0),
  };

  beforeEach(() => {
    translate = jasmine.createSpyObj<TranslateService>(
      'TranslateService',
      ['instant'],
      { currentLang: 'en' },
    );
    translate.instant.and.callFake((key: string) => {
      const values: Record<string, string> = {
        'calculator.method.ingredientsTitle': 'Ingredients',
        'calculator.method.stepsTitle': 'Steps',
        'calculator.method.titles.poolish': 'Poolish',
        'common.ingredients.flour': 'Flour',
        'common.ingredients.yeast': 'Yeast',
        'calculator.method.steps.bake.title': '<strong>Bake</strong>',
        'calculator.method.steps.bake.helper.descriptions.0':
          'Bake at full heat.',
      };
      return values[key] ?? key;
    });

    TestBed.configureTestingModule({
      providers: [
        MethodTextService,
        { provide: TranslateService, useValue: translate },
      ],
    });
    service = TestBed.inject(MethodTextService);
  });

  it('shares ingredient sections and the complete method without HTML', () => {
    const text = service.getText(method, {
      onlyIngredients: false,
      withHelperDescriptions: true,
    });

    expect(text).toContain('Poolish:\n• Flour: 302 g\n• Yeast: 0.8 g');
    expect(text).toContain('Steps:\n1. Bake\n   • Bake at full heat.');
    expect(text).not.toContain('<strong>');
  });

  it('can share only the precise ingredient quantities', () => {
    const text = service.getText(method, {
      onlyIngredients: true,
      withHelperDescriptions: true,
    });

    expect(text).toContain('• Yeast: 0.8 g');
    expect(text).not.toContain('Steps:');
    expect(text).not.toContain('Bake');
  });
});
