import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DEFAULT_DOUGH_CONSTANTS, DoughConstants } from '../dough.constants';
import { PrefsStorage } from '../../../shared/services/prefs-storage.service';

/**
 * Runtime configuration for the dough feature.
 *
 * – merges persisted overrides with the build-time defaults;
 * – exposes the data as an observable for template binding;
 * – exposes synchronous getter for calculators and pipes.
 */
@Injectable({ providedIn: 'root' })
export class CalculatorConfigService {
  private readonly STORAGE_KEY = 'calculator:config';

  private readonly _state = new BehaviorSubject<DoughConstants>(
    this.loadInitial(),
  );

  /**
   * Observable that emits whenever a constant is changed.
   * Useful for components that need live updates.
   */
  readonly constants$ = this._state.asObservable();

  /** Synchronous accessor for pure functions or pipes. */
  get constants(): DoughConstants {
    return this._state.value;
  }

  constructor(private prefs: PrefsStorage) {}

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Partially updates the constants and persists only the delta.
   */
  update(partial: Partial<DoughConstants>): void {
    const next = this.deepMerge(this._state.value, partial);
    this._state.next(next);
    // Persist only the overrides so we can still evolve DEFAULT_DOUGH_CONSTANTS
    this.prefs.set(this.STORAGE_KEY, partial);
  }

  /** Restores factory defaults and clears persisted overrides. */
  reset(): void {
    this._state.next({ ...DEFAULT_DOUGH_CONSTANTS });
    this.prefs.remove(this.STORAGE_KEY);
  }

  // ---------------------------------------------------------------------------
  // Implementation details
  // ---------------------------------------------------------------------------

  private loadInitial(): DoughConstants {
    const overrides =
      this.prefs.get<Partial<DoughConstants>>(this.STORAGE_KEY) ?? {};
    return this.deepMerge(DEFAULT_DOUGH_CONSTANTS, overrides);
  }

  /**
   * Very small deep-merge helper (handles one nesting level which is enough for
   * the current DoughConstants shape).
   */
  private deepMerge<T extends object, U extends Partial<T>>(
    base: T,
    patch: U,
  ): T {
    const result = { ...base, ...patch } as T;

    // Manually merge first-level nested objects so that we don’t lose untouched
    // sub-properties when a parent group is partially overridden.
    if ('poolish' in patch && patch.poolish) {
      // @ts-expect-error – we know the property exists on T
      result.poolish = { ...base.poolish, ...patch.poolish };
    }
    if ('yeast' in patch && patch.yeast) {
      // @ts-expect-error – we know the property exists on T
      result.yeast = { ...base.yeast, ...patch.yeast };
    }
    return result;
  }
}
