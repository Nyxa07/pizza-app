import { DatePipe } from '@angular/common';
import { Injectable, Pipe, PipeTransform, inject } from '@angular/core';

import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';

/**
 * Clock time in the active locale (« 21:00 » / "9:00 PM"), following the
 * in-app language switch like NumberPipe does.
 */
@Pipe({
  name: 'time',
  standalone: true,
  pure: false,
})
@Injectable({
  providedIn: 'root',
})
export class TimePipe implements PipeTransform {
  private readonly localeManager = inject(LocaleManagerService);

  private cachedLocale = '';
  private cachedPipe?: DatePipe;

  transform(value: Date | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const currentLocale =
      this.localeManager.getCurrentAngularLocale() ?? 'en-US';

    if (this.cachedLocale !== currentLocale || !this.cachedPipe) {
      this.cachedLocale = currentLocale;
      this.cachedPipe = new DatePipe(currentLocale);
    }

    return this.cachedPipe.transform(value, 'shortTime') ?? '';
  }
}
