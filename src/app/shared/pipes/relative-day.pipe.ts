import { Injectable, Pipe, PipeTransform, inject } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { relativeDayKey } from 'src/app/shared/helpers/relative-day';

/**
 * Localised relative day for a moment seen from now (« ce soir »,
 * « demain », "Friday"), backed by the `common.time.relativeDay.*` keys.
 */
@Pipe({
  name: 'relativeDay',
  standalone: true,
  pure: false,
})
@Injectable({
  providedIn: 'root',
})
export class RelativeDayPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(value: Date | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return this.translate.instant(
      'common.time.relativeDay.' + relativeDayKey(value, new Date()),
    );
  }
}
