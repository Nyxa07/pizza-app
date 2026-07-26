import { DecimalPipe } from '@angular/common';
import { Injectable, Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';

/**
 * The app's only number formatter: it formats on the language the user picked
 * in the settings, and re-formats when they change it without a restart.
 *
 * It deliberately shadows the `number` name of `@angular/common`'s
 * `DecimalPipe`, which resolves its locale from `LOCALE_ID` — a token this app
 * never provides, so it silently falls back to `en-US` and prints « 2.8% » to
 * a French user (issue #96). A component importing the wrong one of the two
 * still compiles and renders; only the output differs. Hence the invariant,
 * enforced by `no-restricted-imports` in `.eslintrc.json`: this file is the
 * only place in the app allowed to import `DecimalPipe`.
 */
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
  private readonly localeManager = inject(LocaleManagerService);

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
