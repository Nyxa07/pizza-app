import { Injectable } from '@angular/core';

/**
 * Minimal wrapper around the chosen persistence mechanism (here: `localStorage`).
 * Having a dedicated service means the implementation can be swapped (Capacitor
 * Storage, IndexedDB, etc.) without touching consumers.
 */
@Injectable({ providedIn: 'root' })
export class PrefsStorage {
  private readonly cacheVersion = 2;
  private storage: Storage = localStorage;

  constructor() {}

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(`${this.cacheVersion}:${key}`);
      if (!item) {
        return null;
      }
      const parsed = JSON.parse(item) as { value: T; expiresAt: number | null };
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        this.remove(key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T, expiresIn?: number): void {
    const item = {
      value,
      expiresAt: expiresIn ? Date.now() + expiresIn : null,
    };
    this.storage.setItem(`${this.cacheVersion}:${key}`, JSON.stringify(item));
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }
}
