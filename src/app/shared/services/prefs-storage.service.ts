import { Injectable } from '@angular/core';

/**
 * Minimal wrapper around the chosen persistence mechanism (here: `localStorage`).
 * Having a dedicated service means the implementation can be swapped (Capacitor
 * Storage, IndexedDB, etc.) without touching consumers.
 */
@Injectable({ providedIn: 'root' })
export class PrefsStorage {
  private readonly cacheVersion = 1;
  private storage: Storage = localStorage;

  constructor() {}

  get<T>(key: string): T | null {
    try {
      const value = this.storage.getItem(`${this.cacheVersion}:${key}`);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    this.storage.setItem(`${this.cacheVersion}:${key}`, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }
}
