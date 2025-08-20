import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { Locales } from '../enums/locales.enum';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { registerLocaleData } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocaleManagerService {
  private isInitialized = false;
  private readonly STORAGE_KEY = 'locale:current';
  private registeredLocales = new Set<string>();

  constructor(
    private translateService: TranslateService,
    private platform: Platform,
    private prefsStorage: PrefsStorage,
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
    // Register Angular locale data if not already registered
    await this.ensureLocaleRegistered(locale);

    this.translateService.use(
      Object.values(Locales).find((lang) => locale.startsWith(lang)) ??
        Locales.EN,
    );
    this.prefsStorage.set(this.STORAGE_KEY, locale);
  }

  /**
   * Ensure Angular locale data is registered for the given locale
   */
  private async ensureLocaleRegistered(locale: string): Promise<void> {
    const baseLocale = locale.split('-')[0]; // Extract 'en' from 'en-US'

    if (this.registeredLocales.has(baseLocale)) {
      return; // Already registered
    }

    try {
      const localeData = await this.loadLocaleData(baseLocale);
      if (localeData) {
        registerLocaleData(localeData, baseLocale);
        this.registeredLocales.add(baseLocale);
      }
    } catch (error) {
      console.warn(`Failed to load locale data for ${baseLocale}:`, error);
    }
  }

  /**
   * Dynamically import locale data
   */
  private async loadLocaleData(locale: string): Promise<any> {
    switch (locale) {
      case 'en':
        return (await import('@angular/common/locales/en')).default;
      case 'fr':
        return (await import('@angular/common/locales/fr')).default;
      case 'de':
        return (await import('@angular/common/locales/de')).default;
      case 'es':
        return (await import('@angular/common/locales/es')).default;
      case 'it':
        return (await import('@angular/common/locales/it')).default;
      default:
        // Fallback to English
        return (await import('@angular/common/locales/en')).default;
    }
  }

  /**
   * Get current Angular-compatible locale ID
   */
  getCurrentAngularLocale(): string {
    const locale = this.getLocale();
    const localeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      it: 'it-IT',
    };
    return localeMap[locale] || 'en-US';
  }

  private async detectLocale(): Promise<string> {
    const preferredLanguage = this.prefsStorage.get<string>(this.STORAGE_KEY);
    if (preferredLanguage) {
      return preferredLanguage;
    }
    if (this.platform.is('ios') || this.platform.is('android')) {
      const deviceLang = await Device.getLanguageCode();
      if (deviceLang) {
        return deviceLang.value;
      }
    }
    return navigator.language.substring(0, 2);
  }

  getLocale() {
    return this.prefsStorage.get<string>(this.STORAGE_KEY) ?? Locales.EN;
  }
}
