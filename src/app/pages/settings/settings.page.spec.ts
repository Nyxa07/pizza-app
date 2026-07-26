import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import {
  TranslateCompiler,
  TranslateService,
  provideTranslateService,
} from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { firstValueFrom } from 'rxjs';

import { Locales } from 'src/app/features/settings/enums/locales.enum';
import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';
import enCommon from 'src/assets/i18n/en/common.json';
import enPages from 'src/assets/i18n/en/pages.json';
import enSettings from 'src/assets/i18n/en/settings.json';
import frCommon from 'src/assets/i18n/fr/common.json';
import frPages from 'src/assets/i18n/fr/pages.json';
import frSettings from 'src/assets/i18n/fr/settings.json';

import { SettingsPage } from './settings.page';

/**
 * The Settings screen is the single place that decides which sections show up
 * and in which order (issue #96), so it is also the single seam these specs
 * assert on: rendered text and rendered order, never which pipe or which
 * component produced them.
 */
describe('SettingsPage', () => {
  const catalogs = {
    [Locales.FR]: { common: frCommon, pages: frPages, settings: frSettings },
    [Locales.EN]: { common: enCommon, pages: enPages, settings: enSettings },
  };

  /**
   * Renders the page with the app pinned to `locale`. The locale is fixed
   * explicitly rather than inherited from the test browser, so number
   * formatting is asserted on the app's language and not on the machine's.
   */
  const renderIn = async (
    locale: Locales,
  ): Promise<ComponentFixture<SettingsPage>> => {
    registerLocaleData(localeFr);

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        provideIonicAngular({ animated: false }),
        provideRouter([]),
        provideTranslateService({
          compiler: {
            provide: TranslateCompiler,
            useClass: TranslateMessageFormatCompiler,
          },
        }),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
        {
          provide: LocaleManagerService,
          useValue: {
            getLocale: () => locale,
            getCurrentAngularLocale: () =>
              locale === Locales.FR ? 'fr-FR' : 'en-US',
            switchLocale: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(locale, catalogs[locale]);
    await firstValueFrom(translate.use(locale));

    const fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();
    return fixture;
  };

  const textsOf = (
    fixture: ComponentFixture<SettingsPage>,
    selector: string,
  ): string[] =>
    fixture.debugElement
      .queryAll(By.css(selector))
      .map((el) => (el.nativeElement as HTMLElement).textContent?.trim() ?? '');

  const saltOptionsOf = (fixture: ComponentFixture<SettingsPage>): string[] =>
    textsOf(
      fixture,
      'ion-select[formControlName="saltRatio"] ion-select-option',
    );

  it('shows the actionable settings first and the legal notice last', async () => {
    const fixture = await renderIn(Locales.FR);

    expect(textsOf(fixture, 'ion-list-header')).toEqual([
      'Application',
      'Mes pâtes par défaut',
      'Informations légales',
    ]);
  });

  it('writes every salt ratio with a French decimal comma', async () => {
    const fixture = await renderIn(Locales.FR);

    const options = saltOptionsOf(fixture);

    expect(options).toContain('2,8%');
    expect(options.filter((option) => option.includes('.'))).toEqual([]);
  });

  it('keeps the English decimal point for English users', async () => {
    const fixture = await renderIn(Locales.EN);

    const options = saltOptionsOf(fixture);

    expect(options).toContain('2.8%');
    expect(options.filter((option) => option.includes(','))).toEqual([]);
  });

  it('links to the public privacy policy in a new window', async () => {
    const fixture = await renderIn(Locales.FR);

    const link = fixture.debugElement.query(
      By.css('[data-testid="privacy-policy-link"]'),
    ).nativeElement as HTMLElement & { href: string };

    expect(link.href).toBe('https://nyxa07.github.io/pizza-app/privacy/');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
