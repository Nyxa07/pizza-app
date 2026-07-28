import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { ingredientGramsFormat } from 'src/app/features/method/ingredient-grams';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

import type { IDoughFacts } from '../facts/dough-facts.interface';

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
      >{{ facts().totalWeight | number: '1.0-0' }}&nbsp;g</span
    >
    <span class="split">{{
      'calculator.shared.livebar.split'
        | translate
          : {
              flour: facts().split.flour | number: '1.0-0',
              water: facts().split.water | number: '1.0-0',
              salt: facts().split.salt | number: '1.0-0',
              yeast: facts().split.yeast | number: yeastGramsFormat,
            }
    }}</span>
  `,
})
export class CalculatorLivebarComponent {
  readonly facts = input.required<IDoughFacts>();

  protected readonly yeastGramsFormat = ingredientGramsFormat('yeast');
}
