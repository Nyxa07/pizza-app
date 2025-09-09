import { KeepAwake } from '@capacitor-community/keep-awake';
import { Injectable } from '@angular/core';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KeepAwakeService {
  private STORAGE_KEY = 'keepAwake';
  private _isKeptAwake = new BehaviorSubject<boolean>(false);

  constructor(private prefs: PrefsStorage) {}

  async init() {
    const isSupported = await this.isSupported();
    if (isSupported) {
      const isKeptAwake = !!this.prefs.get(this.STORAGE_KEY ?? false);
      if (isKeptAwake) {
        await KeepAwake.keepAwake();
      } else {
        await KeepAwake.allowSleep();
      }
      this._isKeptAwake.next(isKeptAwake);
    }
  }

  isKeptAwake() {
    return this._isKeptAwake.value;
  }

  async setKeepAwake(isKeptAwake: boolean) {
    const isSupported = await this.isSupported();
    if (isSupported) {
      this._isKeptAwake.next(isKeptAwake);
      this.prefs.set(this.STORAGE_KEY, isKeptAwake);
      if (isKeptAwake) {
        KeepAwake.keepAwake();
      } else {
        KeepAwake.allowSleep();
      }
    }
  }

  async isSupported() {
    return KeepAwake.isSupported();
  }
}
