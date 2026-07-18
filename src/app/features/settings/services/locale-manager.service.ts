import { registerLocaleData } from '@angular/common';
import { Injectable, inject } from '@angular/core';

import { Platform } from '@ionic/angular';

import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { Locales } from '../enums/locales.enum';

@Injectable({
  providedIn: 'root',
})
export class LocaleManagerService {
  private isInitialized = false;
  private readonly STORAGE_KEY = 'locale:current';
  private registeredLocales = new Set<string>();

  private readonly translateService = inject(TranslateService);
  private readonly platform = inject(Platform);
  private readonly prefsStorage = inject(PrefsStorage);

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
    const resolved = this.resolveLocale(locale);

    // Register Angular locale data if not already registered
    await this.ensureLocaleRegistered(resolved);

    this.translateService.use(resolved);
    this.prefsStorage.set(this.STORAGE_KEY, resolved);
  }

  /**
   * Map any requested locale (persisted value, device language, regional
   * variant like 'fr-CA') onto a shipped locale, falling back to English.
   */
  private resolveLocale(locale: string | null): Locales {
    return (
      Object.values(Locales).find((lang) => locale?.startsWith(lang)) ??
      Locales.EN
    );
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
  private async loadLocaleData(locale: string): Promise<unknown> {
    switch (locale) {
      case 'fr':
        return (await import('@angular/common/locales/fr')).default;
      default:
        // Fallback to English
        return (await import('@angular/common/locales/en')).default;
    }
  }

  /**
   * Get current Angular-compatible locale ID
   */
  getCurrentAngularLocale(): string {
    const localeMap: Record<Locales, string> = {
      [Locales.EN]: 'en-US',
      [Locales.FR]: 'fr-FR',
    };
    return localeMap[this.getLocale()];
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

  getLocale(): Locales {
    return this.resolveLocale(this.prefsStorage.get<string>(this.STORAGE_KEY));
  }
}
