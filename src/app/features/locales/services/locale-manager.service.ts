import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { Locales } from '../enums/locales.enum';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LocaleManagerService {
  private isInitialized = false;
  private readonly STORAGE_KEY = 'locale:current';

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
    this.translateService.use(
      Object.values(Locales).find((lang) => locale.startsWith(lang)) ??
        Locales.EN,
    );
    this.prefsStorage.set(this.STORAGE_KEY, locale);
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
    return navigator.language;
  }

  getLocale() {
    return this.prefsStorage.get<string>(this.STORAGE_KEY) ?? Locales.EN;
  }
}
