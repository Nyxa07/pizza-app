import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { RelativeDayPipe } from 'src/app/shared/pipes/relative-day.pipe';
import { TimePipe } from 'src/app/shared/pipes/time.pipe';

/**
 * The narrative call to action closing a calculator screen: the door to the
 * Method, dated with the moment the dough is ready. Shared by every path.
 */
@Component({
  selector: 'app-calculator-cta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RelativeDayPipe, TimePipe, TranslatePipe],
  template: `
    <button class="calculator-cta" type="button" (click)="open.emit()">
      {{
        'calculator.shared.cta'
          | translate: { day: readyAt() | relativeDay, time: readyAt() | time }
      }}
    </button>
  `,
})
export class CalculatorCtaComponent {
  readonly readyAt = input.required<Date>();

  readonly open = output<void>();
}
