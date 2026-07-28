import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
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
import enCalculator from 'src/assets/i18n/en/calculator.json';
import frCalculator from 'src/assets/i18n/fr/calculator.json';

import { DoughType } from '../enums/dough-type.enum';
import type { IDoughFacts } from '../facts/dough-facts.interface';
import { CalculatorLivebarComponent } from './calculator-livebar.component';

describe('CalculatorLivebarComponent', () => {
  let fixture: ComponentFixture<CalculatorLivebarComponent>;
  let locale = Locales.FR;

  const factsWith = (yeast: number): IDoughFacts => ({
    balls: 4,
    ballWeight: 250,
    hydrationPct: 62,
    hydrationRatio: 0.62,
    doughType: DoughType.DIRECT,
    ambientHours: 2,
    coldHours: 24,
    restHours: 26,
    totalWeight: 1000,
    split: { flour: 604, water: 375, salt: 18, yeast },
  });

  /** What the split of the live bar reads, in the given language. */
  const splitReads = async (
    spoken: Locales,
    yeast: number,
  ): Promise<string> => {
    locale = spoken;
    await firstValueFrom(TestBed.inject(TranslateService).use(spoken));

    fixture = TestBed.createComponent(CalculatorLivebarComponent);
    fixture.componentRef.setInput('facts', factsWith(yeast));
    fixture.detectChanges();

    return (
      (fixture.nativeElement as HTMLElement).querySelector('.split')
        ?.textContent ?? ''
    );
  };

  beforeEach(async () => {
    registerLocaleData(localeFr);
    registerLocaleData(localeEn);
    locale = Locales.FR;

    await TestBed.configureTestingModule({
      imports: [CalculatorLivebarComponent],
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
            getLocale: () => locale,
            getCurrentAngularLocale: () =>
              locale === Locales.FR ? 'fr-FR' : 'en-US',
          },
        },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(Locales.FR, { calculator: frCalculator });
    translate.setTranslation(Locales.EN, { calculator: enCalculator });
  });

  it('reads the yeast to two decimals, the rest to the gram (fr)', async () => {
    const split = await splitReads(Locales.FR, 0.84);

    expect(split).toContain('604\u00a0g');
    expect(split).toContain('0,84\u00a0g');
  });

  it('reads the yeast to two decimals, the rest to the gram (en)', async () => {
    const split = await splitReads(Locales.EN, 0.84);

    expect(split).toContain('604\u00a0g');
    expect(split).toContain('0.84\u00a0g');
  });

  it('keeps the two decimals on a round yeast dose', async () => {
    const split = await splitReads(Locales.FR, 3);

    expect(split).toContain('3,00\u00a0g');
  });
});
