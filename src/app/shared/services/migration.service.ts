import { Injectable, inject } from '@angular/core';

import { PrefsStorage } from './prefs-storage.service';

/**
 * Preference keys written by the v1 theme catalog (ADR-0001), dropped on
 * first launch after the v2 redesign.
 */
const V1_THEMING_KEYS = [
  'theme',
  'public-theme',
  'secret-theme',
  'discovered-themes',
] as const;

/** Preference key holding the user's language, kept across v1→v2. */
const LOCALE_KEY = 'locale:current';

/** Locales shipped by v2 (issue #67); v1 also had de/es/it. */
const V2_LOCALES = ['en', 'fr'] as const;

const SCHEMA_VERSION_KEY = 'schema-version';

/** Bumped when a release changes the shape of persisted preferences. */
const SCHEMA_VERSION = 2;

/**
 * Single entry point for migrating persisted preferences between app
 * versions. Runs once at startup, before any other service reads its
 * keys; each step must leave unrelated preferences untouched.
 */
@Injectable({ providedIn: 'root' })
export class MigrationService {
  private readonly prefsStorage = inject(PrefsStorage);

  run(): void {
    const version = this.prefsStorage.get<number>(SCHEMA_VERSION_KEY) ?? 1;
    if (version >= SCHEMA_VERSION) {
      return;
    }

    this.removeV1ThemingKeys();
    this.removeDroppedLocale();

    this.prefsStorage.set(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
  }

  /** v1→v2: the theme catalog is gone (ADR-0001), drop its persisted keys. */
  private removeV1ThemingKeys(): void {
    for (const key of V1_THEMING_KEYS) {
      this.prefsStorage.remove(key);
    }
  }

  /**
   * v1→v2: locales are reduced to FR + EN (issue #67). A persisted locale
   * v2 no longer ships is dropped so the next launch falls back to the
   * system language, exactly like a first install.
   */
  private removeDroppedLocale(): void {
    const locale = this.prefsStorage.get<unknown>(LOCALE_KEY);
    if (locale === null) {
      return;
    }
    const isStillShipped =
      typeof locale === 'string' &&
      V2_LOCALES.some((lang) => locale.startsWith(lang));
    if (!isStillShipped) {
      this.prefsStorage.remove(LOCALE_KEY);
    }
  }
}
