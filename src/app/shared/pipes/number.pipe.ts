import { DecimalPipe } from '@angular/common';
import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { LocaleManagerService } from 'src/app/features/locales/services/locale-manager.service';

@Pipe({
  name: 'number',
  standalone: true,
  pure: false,
})
@Injectable({
  providedIn: 'root',
})
export class NumberPipe implements PipeTransform {
  private cachedLocale = '';
  private cachedPipe?: DecimalPipe;

  constructor(private localeManager: LocaleManagerService) {}

  transform(value: number | null | undefined, format: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    const currentLocale =
      this.localeManager.getCurrentAngularLocale() ?? 'en-US';

    // Cache the DecimalPipe instance
    if (this.cachedLocale !== currentLocale || !this.cachedPipe) {
      this.cachedLocale = currentLocale;
      this.cachedPipe = new DecimalPipe(currentLocale);
    }

    return this.cachedPipe.transform(value, format) ?? value.toString();
  }
}
