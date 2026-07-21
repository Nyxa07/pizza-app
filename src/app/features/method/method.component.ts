import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import { RelativeDayPipe } from 'src/app/shared/pipes/relative-day.pipe';
import { TimePipe } from 'src/app/shared/pipes/time.pipe';

import type { IMethod, IMethodStep } from './interfaces/method.interface';

/**
 * The full Dough method in the v2 identity (issue #72): the weigh-in per
 * part, then the dated run of steps — milestones on the accent clock,
 * helpers folded inline — down to the bake.
 */
@Component({
  selector: 'app-method',
  templateUrl: './method.component.html',
  styleUrls: ['./method.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    NumberPipe,
    RelativeDayPipe,
    TimePipe,
    TranslatePipe,
  ],
})
export class MethodComponent {
  readonly method = input.required<IMethod>();

  private readonly translate = inject(TranslateService);
  private readonly numberPipe = inject(NumberPipe);

  /** « 302 g de farine · 302 g d'eau… » — what the step engages. */
  protected quantitiesLine(step: IMethodStep): string {
    return step.ingredients
      .map((ingredient) =>
        this.translate.instant(
          'calculator.method.ingredients.' + ingredient.key,
          {
            grams: this.numberPipe.transform(
              ingredient.grams,
              ingredient.key === 'yeast' ? '1.0-1' : '1.0-0',
            ),
          },
        ),
      )
      .join(' · ');
  }
}
