import { TestBed } from '@angular/core/testing';

import { TranslateService, provideTranslateService } from '@ngx-translate/core';

import { MigrationService } from 'src/app/shared/services/migration.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { Locales } from '../enums/locales.enum';
import { LocaleManagerService } from './locale-manager.service';

describe('LocaleManagerService', () => {
  let service: LocaleManagerService;
  let translate: TranslateService;
  let prefs: FakePrefsStorage;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: prefs },
      ],
    });
    service = TestBed.inject(LocaleManagerService);
    translate = TestBed.inject(TranslateService);
  });

  it('falls back to English for a locale v2 no longer ships', async () => {
    await service.switchLocale('it');

    expect(translate.getCurrentLang()).toBe(Locales.EN);
    expect(prefs.get('locale:current')).toBe(Locales.EN);
  });

  it('never reports a locale that is not shipped (residual v1 value)', () => {
    prefs.set('locale:current', 'de');

    expect(service.getLocale()).toBe(Locales.EN);
  });

  describe('first launch of a v1 user (migration then init)', () => {
    const fakeSystemLanguage = (language: string) => {
      Object.defineProperty(navigator, 'language', {
        value: language,
        configurable: true,
      });
    };

    afterEach(() => {
      delete (navigator as { language?: string }).language;
    });

    it('falls back to English when the system language is not French', async () => {
      prefs.set('locale:current', 'it');
      fakeSystemLanguage('de-DE');

      TestBed.inject(MigrationService).run();
      await service.init();

      expect(translate.getCurrentLang()).toBe(Locales.EN);
      expect(prefs.get('locale:current')).toBe(Locales.EN);
    });

    it('falls back to French when the system language is French', async () => {
      prefs.set('locale:current', 'de');
      fakeSystemLanguage('fr-CA');

      TestBed.inject(MigrationService).run();
      await service.init();

      expect(translate.getCurrentLang()).toBe(Locales.FR);
      expect(prefs.get('locale:current')).toBe(Locales.FR);
    });
  });
});
