import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Device } from '@capacitor/device';

export const SUPPORTED_LANGUAGES = ['en', 'de', 'es', 'it', 'fr'];

export const SUPPORTED_LANGUAGES_MAP = {
  en: 'english',
  de: 'german',
  es: 'spanish',
  it: 'italian',
  fr: 'french',
};

@Injectable({
  providedIn: 'root',
})
export class LocaleManagerService {
  private isInitialized = false;

  constructor(
    private translateService: TranslateService,
    private platform: Platform,
  ) {}

  /**
   * Initialize the current language of the app
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    const locale = await this.detectLocale();
    await this.switchLocale(locale);
    this.isInitialized = true;
  }

  /**
   * Switch the locale for the app and saves it in local storage
   * @param locale - The locale to switch to
   */
  async switchLocale(locale: string) {
    this.translateService.use(
      SUPPORTED_LANGUAGES.find((lang) => locale.startsWith(lang)) ?? 'en',
    );
    localStorage.setItem('LanguageManager:locale', locale);
  }

  private async detectLocale(): Promise<string> {
    const preferredLanguage = localStorage.getItem('LanguageManager:locale');
    if (preferredLanguage) {
      return preferredLanguage;
    }
    if (this.platform.is('ios') || this.platform.is('android')) {
      const deviceLang = await Device.getLanguageCode();
      if (deviceLang) {
        return deviceLang.value;
      }
    }
    return navigator.language;
  }
}
