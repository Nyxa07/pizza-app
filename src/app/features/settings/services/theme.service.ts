import { Injectable } from '@angular/core';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';
  private darkMode = this.prefsStorage.get<string>(this.STORAGE_KEY) === 'dark';

  constructor(private prefsStorage: PrefsStorage) {}

  init() {
    const theme = this.prefsStorage.get<string>(this.STORAGE_KEY);
    if (theme) {
      this.darkMode = theme === 'dark';
      document.documentElement.classList.toggle(
        'ion-palette-dark',
        this.darkMode,
      );
    }
  }

  setDarkMode(isDarkMode: boolean) {
    this.darkMode = isDarkMode;
    this.prefsStorage.set(this.STORAGE_KEY, this.darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle(
      'ion-palette-dark',
      this.darkMode,
    );
  }

  isDarkMode() {
    return this.darkMode;
  }
}
