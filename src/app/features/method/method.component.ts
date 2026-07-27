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

import { ingredientGramsFormat } from './ingredient-grams';
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

  /** The weigh-in reads its grams like the narrated steps below it. */
  protected readonly gramsFormat = ingredientGramsFormat;

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
              ingredientGramsFormat(ingredient.key),
            ),
          },
        ),
      )
      .join(' · ');
  }
}
