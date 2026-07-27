import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  TranslateCompiler,
  TranslateService,
  provideTranslateService,
} from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { firstValueFrom } from 'rxjs';

import { Locales } from 'src/app/features/settings/enums/locales.enum';
import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';
import frCalculator from 'src/assets/i18n/fr/calculator.json';
import frCommon from 'src/assets/i18n/fr/common.json';

import type { IMethod } from './interfaces/method.interface';
import { MethodComponent } from './method.component';

describe('MethodComponent', () => {
  let fixture: ComponentFixture<MethodComponent>;

  const at = new Date(2026, 6, 14, 21, 0);

  const method: IMethod = {
    sections: [
      {
        title: 'calculator.method.titles.directDough',
        ingredients: [
          { key: 'flour', grams: 604 },
          { key: 'water', grams: 375 },
          { key: 'yeast', grams: 0.84 },
          { key: 'salt', grams: 18 },
        ],
      },
    ],
    steps: [
      {
        icon: [],
        at,
        title: 'calculator.method.steps.mixIngredients.title',
        variables: {},
        helper: null,
        ingredients: [
          { key: 'water', grams: 375 },
          { key: 'yeast', grams: 0.84 },
        ],
      },
    ],
    startAt: at,
    readyAt: new Date(2026, 6, 15, 8, 0),
  };

  beforeEach(async () => {
    registerLocaleData(localeFr);

    await TestBed.configureTestingModule({
      imports: [MethodComponent],
      providers: [
        provideTranslateService({
          compiler: {
            provide: TranslateCompiler,
            useClass: TranslateMessageFormatCompiler,
          },
        }),
        {
          provide: LocaleManagerService,
          useValue: {
            getLocale: () => Locales.FR,
            getCurrentAngularLocale: () => 'fr-FR',
          },
        },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(Locales.FR, {
      calculator: frCalculator,
      common: frCommon,
    });
    await firstValueFrom(translate.use(Locales.FR));

    fixture = TestBed.createComponent(MethodComponent);
    fixture.componentRef.setInput('method', method);
    fixture.detectChanges();
  });

  const textOf = (selector: string): string =>
    (
      (fixture.nativeElement as HTMLElement).querySelector(selector)
        ?.textContent ?? ''
    )
      .replace(/\s+/g, ' ')
      .trim();

  it('weighs the yeast in to two decimals, the rest to the gram', () => {
    const weighIn = textOf('.part');

    expect(weighIn).toContain('604 g');
    expect(weighIn).toContain('375 g');
    expect(weighIn).toContain('0,84 g');
    expect(weighIn).toContain('18 g');
  });

  it('narrates the step quantities with the same two decimals', () => {
    expect(textOf('.quantities')).toBe("375 g d'eau · 0,84 g de levure");
  });
});
