import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

/**
 * In-memory PrefsStorage for specs — the seam validated by the v2 testing
 * decisions (issue #65): services are exercised through their public API
 * with preference storage swapped for this fake.
 *
 * Provide it with `{ provide: PrefsStorage, useValue: new FakePrefsStorage() }`.
 */
export class FakePrefsStorage extends PrefsStorage {
  private readonly store = new Map<string, unknown>();

  override get<T>(key: string): T | null {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }

  override set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  override remove(key: string): void {
    this.store.delete(key);
  }

  /** Test helper: every stored key. */
  keys(): string[] {
    return [...this.store.keys()];
  }
}
