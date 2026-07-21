import { Injectable, inject, signal } from '@angular/core';

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import { Appearance } from '../enums/appearance.enum';

/** The two concrete renderings an appearance preference can resolve to. */
type ResolvedAppearance = Appearance.Light | Appearance.Dark;

const APPEARANCE_KEY = 'appearance';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/**
 * Applies the app's appearance (system / light / dark) by stamping
 * [data-appearance] on <html>, which the semantic token layer in
 * src/theme/variables.scss maps to the light or dark palette. Also keeps
 * the native status bar in sync, reading the computed --bg token so no
 * color table is duplicated here.
 */
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly prefsStorage = inject(PrefsStorage);

  private readonly _appearance = signal<Appearance>(Appearance.System);

  /** The persisted user preference (system / light / dark). */
  public readonly appearance = this._appearance.asReadonly();

  /**
   * Apply the persisted appearance and start following the system scheme.
   * Called once at app start, before the first render.
   */
  init(): void {
    const saved = this.prefsStorage.get<Appearance>(APPEARANCE_KEY);
    if (saved && Object.values(Appearance).includes(saved)) {
      this._appearance.set(saved);
    }
    this.apply();

    // Root service: listens for the whole app lifetime, no teardown needed.
    window.matchMedia(DARK_SCHEME_QUERY).addEventListener('change', () => {
      if (this._appearance() === Appearance.System) {
        this.apply();
      }
    });
  }

  setAppearance(appearance: Appearance): void {
    this._appearance.set(appearance);
    this.prefsStorage.set(APPEARANCE_KEY, appearance);
    this.apply();
  }

  /** The light or dark rendering currently in effect. */
  resolvedAppearance(): ResolvedAppearance {
    const preference = this._appearance();
    if (preference === Appearance.System) {
      return window.matchMedia(DARK_SCHEME_QUERY).matches
        ? Appearance.Dark
        : Appearance.Light;
    }
    return preference;
  }

  private apply(): void {
    const resolved = this.resolvedAppearance();
    document.documentElement.dataset['appearance'] = resolved;
    void this.syncStatusBar(resolved);
  }

  private async syncStatusBar(resolved: ResolvedAppearance): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const background = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg')
        .trim();
      await StatusBar.setStyle({
        style: resolved === Appearance.Dark ? Style.Dark : Style.Light,
      });
      if (background) {
        await StatusBar.setBackgroundColor({ color: background });
      }
    } catch (error) {
      console.warn('Failed to sync status bar with appearance:', error);
    }
  }
}
