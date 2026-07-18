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
const SCHEMA_VERSION = 5;

/**
 * Per-mode field-visibility settings written by the v1 personalisation
 * screen, gone with the Expert screen's progressive disclosure
 * (issue #71, ADR-0002).
 */
const V1_FIELD_VISIBILITY_KEYS = [
  'calculator:settings:simple',
  'calculator:settings:complex',
  'calculator:settings:assist',
] as const;

/** The retired v1 assistant kept a second, conflicting copy of its state. */
const V1_ASSISTANT_KEYS = [
  'assistant:data',
  'assistant:currentStepIndex',
] as const;

/**
 * v1 kept one auto-persisted draft per calculator mode. v1 drafts carry no
 * timestamp, so "most recent" is unknowable; the merge keeps the first
 * existing draft in this order — the mode exposing the most fields wins,
 * as the best proxy for the user's real work (ADR-0002).
 */
const V1_MODE_DRAFT_KEYS = [
  'calculator:complex',
  'calculator:assist',
  'calculator:simple',
] as const;

/** The single Draft shared by every calculator path (ADR-0002). */
const DRAFT_KEY = 'calculator:draft';

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

    if (version < 2) {
      this.removeV1ThemingKeys();
      this.removeDroppedLocale();
    }
    if (version < 3) {
      this.mergeModeDraftsIntoSingleDraft();
    }
    if (version < 4) {
      this.removeFieldVisibilitySettings();
    }
    if (version < 5) {
      this.removeAssistantState();
    }

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

  /**
   * v2→v3 (issue #68): the per-mode drafts collapse into the single Draft.
   * An already-written Draft is never overwritten (no implicit overwrite,
   * ever); the v1 silos are dropped either way.
   */
  private mergeModeDraftsIntoSingleDraft(): void {
    for (const key of V1_MODE_DRAFT_KEYS) {
      const draft = this.prefsStorage.get<unknown>(key);
      if (
        draft !== null &&
        this.prefsStorage.get<unknown>(DRAFT_KEY) === null
      ) {
        this.prefsStorage.set(DRAFT_KEY, draft);
      }
      this.prefsStorage.remove(key);
    }
  }

  /**
   * v3→v4 (issue #71): the field-visibility screen is gone; its persisted
   * per-mode toggles would otherwise keep overriding which fields the
   * engine treats as auto on the Expert screen.
   */
  private removeFieldVisibilitySettings(): void {
    for (const key of V1_FIELD_VISIBILITY_KEYS) {
      this.prefsStorage.remove(key);
    }
  }

  /** v4→v5 (issue #73): Guided reads only the shared Draft. */
  private removeAssistantState(): void {
    for (const key of V1_ASSISTANT_KEYS) {
      this.prefsStorage.remove(key);
    }
  }
}
