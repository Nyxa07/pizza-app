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

import type { IMethodPreview } from '../services/method-preview.service';
import { CalculatorMethodPreviewComponent } from './calculator-method-preview.component';

describe('CalculatorMethodPreviewComponent', () => {
  let fixture: ComponentFixture<CalculatorMethodPreviewComponent>;

  beforeEach(async () => {
    registerLocaleData(localeFr);

    await TestBed.configureTestingModule({
      imports: [CalculatorMethodPreviewComponent],
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
    translate.setTranslation(Locales.FR, { calculator: frCalculator });
    await firstValueFrom(translate.use(Locales.FR));

    fixture = TestBed.createComponent(CalculatorMethodPreviewComponent);
  });

  it('renders every ingredient quantity without leaking translation keys', () => {
    const preview: IMethodPreview = {
      steps: [
        {
          at: new Date(2026, 6, 20, 10, 45),
          bodyKey: 'calculator.shared.method.steps.directMix',
          bodyParams: {},
          ingredients: [
            { key: 'flour', grams: 755 },
            { key: 'water', grams: 468 },
            { key: 'yeast', grams: 2.1 },
            { key: 'salt', grams: 21 },
            { key: 'honey', grams: 3 },
            { key: 'oliveOil', grams: 12 },
          ],
        },
        {
          at: new Date(2026, 6, 21, 11, 45),
          bodyKey: 'calculator.shared.method.steps.directBalls',
          bodyParams: { count: 4, weight: 250 },
          ingredients: [],
        },
      ],
      readyAt: new Date(2026, 6, 21, 14, 0),
      totalSteps: 11,
    };
    fixture.componentRef.setInput('preview', preview);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('755\u00a0g de farine');
    expect(text).toContain("468\u00a0g d'eau");
    expect(text).toContain('2,1\u00a0g de levure');
    expect(text).toContain('21\u00a0g de sel');
    expect(text).toContain('3\u00a0g de miel');
    expect(text).toContain("12\u00a0g d'huile d'olive");
    expect(text).not.toContain('calculator.');
  });
});
