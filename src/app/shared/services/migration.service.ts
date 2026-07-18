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

    this.prefsStorage.set(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
  }

  /** v1→v2: the theme catalog is gone (ADR-0001), drop its persisted keys. */
  private removeV1ThemingKeys(): void {
    for (const key of V1_THEMING_KEYS) {
      this.prefsStorage.remove(key);
    }
  }
}
