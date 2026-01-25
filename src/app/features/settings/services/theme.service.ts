import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { SecretTheme } from '../enums/secret-theme.enum';
import { Theme } from '../enums/theme.enum';

/**
 * Theme CSS class mapping for public themes.
 * Add new themes here with their corresponding body class.
 */
const THEME_CLASSES: Record<Theme, string | null> = {
  [Theme.Original]: null, // Original theme has no extra class
  [Theme.Cyberpunk]: 'cyberpunk-theme',
};

/**
 * Theme CSS class mapping for secret themes.
 * Add new themes here with their corresponding body class.
 */
const SECRET_THEME_CLASSES: Record<SecretTheme, string | null> = {
  [SecretTheme.None]: null,
  [SecretTheme.Konami]: 'konami-theme',
  // Future themes:
  // [SecretTheme.Retro]: 'retro-theme',
  // [SecretTheme.Neon]: 'neon-theme',
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly DARK_MODE_KEY = 'theme';
  private readonly PUBLIC_THEME_KEY = 'public-theme';
  private readonly SECRET_THEME_KEY = 'secret-theme';

  private darkMode = this.prefsStorage.get<string>(this.DARK_MODE_KEY) === 'dark';

  private theme = new BehaviorSubject<Theme>(
    this.prefsStorage.get<Theme>(this.PUBLIC_THEME_KEY) ?? Theme.Original
  );
  public theme$ = this.theme.asObservable();

  private secretTheme = new BehaviorSubject<SecretTheme>(
    this.prefsStorage.get<SecretTheme>(this.SECRET_THEME_KEY) ?? SecretTheme.None
  );
  public secretTheme$ = this.secretTheme.asObservable();

  constructor(private prefsStorage: PrefsStorage) { }

  /**
   * Initialize themes from storage on app start.
   */
  init(): void {
    // Dark mode
    const darkModeValue = this.prefsStorage.get<string>(this.DARK_MODE_KEY);
    if (darkModeValue) {
      this.darkMode = darkModeValue === 'dark';
      document.documentElement.classList.toggle('ion-palette-dark', this.darkMode);
    }

    // Public theme
    const savedPublicTheme = this.prefsStorage.get<Theme>(this.PUBLIC_THEME_KEY);
    if (savedPublicTheme) {
      this.applyTheme(savedPublicTheme);
    }

    // Secret theme
    const savedSecretTheme = this.prefsStorage.get<SecretTheme>(this.SECRET_THEME_KEY);
    if (savedSecretTheme && savedSecretTheme !== SecretTheme.None) {
      this.applySecretTheme(savedSecretTheme);
    }
  }

  // ============================================
  // Dark Mode
  // ============================================

  setDarkMode(isDarkMode: boolean): void {
    this.darkMode = isDarkMode;
    this.prefsStorage.set(this.DARK_MODE_KEY, this.darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('ion-palette-dark', this.darkMode);
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  // ============================================
  // Public Themes
  // ============================================

  /**
   * Get the current public theme.
   */
  getTheme(): Theme {
    return this.theme.value;
  }

  /**
   * Set and persist a public theme.
   * Does nothing if a secret theme is currently active.
   */
  setTheme(theme: Theme): void {
    // Ignore theme changes while a secret theme is active
    if (this.secretTheme.value !== SecretTheme.None) {
      return;
    }

    // Remove previous theme class
    this.removeAllThemeClasses();

    // Apply new theme
    this.applyTheme(theme);

    // Persist
    this.prefsStorage.set(this.PUBLIC_THEME_KEY, theme);
    this.theme.next(theme);
  }

  private applyTheme(theme: Theme): void {
    const className = THEME_CLASSES[theme];
    if (className) {
      document.body.classList.add(className);
    }
  }

  private removeAllThemeClasses(): void {
    Object.values(THEME_CLASSES).forEach((className) => {
      if (className) {
        document.body.classList.remove(className);
      }
    });
  }

  // ============================================
  // Secret Themes
  // ============================================

  /**
   * Get the current secret theme.
   */
  getSecretTheme(): SecretTheme {
    return this.secretTheme.value;
  }

  /**
   * Set and persist a secret theme.
   * When activating a secret theme, public themes are removed to avoid conflicts.
   * When deactivating, the saved public theme is restored.
   */
  setSecretTheme(theme: SecretTheme): void {
    // Remove previous secret theme class
    this.removeAllSecretThemeClasses();

    if (theme !== SecretTheme.None) {
      // Activating secret theme: remove public theme classes to avoid conflicts
      this.removeAllThemeClasses();
      this.applySecretTheme(theme);
    } else {
      // Deactivating secret theme: restore the saved public theme
      const savedPublicTheme = this.theme.value;
      this.applyTheme(savedPublicTheme);
    }

    // Persist
    this.prefsStorage.set(this.SECRET_THEME_KEY, theme);
    this.secretTheme.next(theme);
  }

  /**
   * Toggle a specific secret theme on/off.
   */
  toggleSecretTheme(theme: SecretTheme): void {
    const currentTheme = this.secretTheme.value;
    if (currentTheme === theme) {
      this.setSecretTheme(SecretTheme.None);
    } else {
      this.setSecretTheme(theme);
    }
  }

  /**
   * Check if a specific secret theme is active.
   */
  isSecretThemeActive(theme: SecretTheme): boolean {
    return this.secretTheme.value === theme;
  }

  private applySecretTheme(theme: SecretTheme): void {
    const className = SECRET_THEME_CLASSES[theme];
    if (className) {
      document.body.classList.add(className);
    }
  }

  private removeAllSecretThemeClasses(): void {
    Object.values(SECRET_THEME_CLASSES).forEach((className) => {
      if (className) {
        document.body.classList.remove(className);
      }
    });
  }
}
