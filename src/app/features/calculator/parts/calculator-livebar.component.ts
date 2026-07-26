import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

import type { ICalculatorResult } from './calculator-result';

/**
 * The pinned live result bar: the total dough weight and how it splits across
 * flour, water, salt and yeast. Shared by every calculator path, so the
 * quantity always reads the same whichever screen the user is on.
 */
@Component({
  selector: 'app-calculator-livebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NumberPipe, TranslatePipe],
  host: { class: 'livebar num' },
  template: `
    <span class="total" aria-live="polite"
      >{{ result().total | number: '1.0-0' }} g</span
    >
    <span class="split">{{
      'calculator.shared.livebar.split'
        | translate
          : {
              flour: result().split.flour | number: '1.0-0',
              water: result().split.water | number: '1.0-0',
              salt: result().split.salt | number: '1.0-0',
              yeast: result().split.yeast | number: '1.0-1',
            }
    }}</span>
  `,
})
export class CalculatorLivebarComponent {
  readonly result = input.required<ICalculatorResult>();
}
