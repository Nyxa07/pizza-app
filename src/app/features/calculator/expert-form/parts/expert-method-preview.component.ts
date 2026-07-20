import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import { RelativeDayPipe } from 'src/app/shared/pipes/relative-day.pipe';
import { TimePipe } from 'src/app/shared/pipes/time.pipe';

import type {
  IMethodPreview,
  IMethodPreviewStep,
} from '../../services/method-preview.service';

/**
 * The « aperçu de la Méthode » card (variant D): the two first dated
 * interventions narrated with their real quantities, and the door to the
 * full method.
 */
@Component({
  selector: 'app-expert-method-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RelativeDayPipe, TimePipe, TranslatePipe],
  template: `
    <h3>{{ 'calculator.expert.method.title' | translate }}</h3>
    @for (step of preview().steps; track step.bodyKey) {
      <div class="step">
        <span class="when">
          {{ step.at | relativeDay }}<br />
          <span class="num">{{ step.at | time }}</span>
        </span>
        <span class="what num" [innerHTML]="body(step)"></span>
      </div>
    }
    <button class="more" type="button" (click)="openFull.emit()">
      {{
        'calculator.expert.method.fullMethod'
          | translate: { count: preview().totalSteps }
      }}
    </button>
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-l);
      box-shadow: var(--shadow);
    }

    h3 {
      padding: 14px 18px 0;
      font-family: var(--font-voice);
      font-style: italic;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--ink-2);
    }

    .step {
      display: flex;
      gap: 14px;
      padding: 14px 18px;

      + .step {
        border-top: 1px solid var(--hairline);
      }
    }

    .when {
      padding-top: 2px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
      color: var(--accent);
    }

    .what {
      font-size: 0.88rem;
      line-height: 1.45;
      color: var(--ink);
    }

    .more {
      display: block;
      width: 100%;
      padding: 12px;
      border: none;
      border-top: 1px solid var(--hairline);
      background: none;
      color: var(--accent);
      font: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
    }
  `,
})
export class ExpertMethodPreviewComponent {
  readonly preview = input.required<IMethodPreview>();
  readonly openFull = output<void>();

  private readonly translate = inject(TranslateService);
  private readonly localeManager = inject(LocaleManagerService);
  private readonly numberPipe = inject(NumberPipe);

  /**
   * The narrated sentence of one step: its ingredient quantities are
   * bolded, localised and joined by the locale's conjunction rules
   * (« , … et » / ", … and").
   */
  protected body(step: IMethodPreviewStep): string {
    const items = step.ingredients.map(
      (ingredient) =>
        `<b>${this.translate.instant(
          'calculator.method.ingredients.' + ingredient.key,
          {
            grams: this.numberPipe.transform(
              ingredient.grams,
              ingredient.key === 'yeast' ? '1.0-1' : '1.0-0',
            ),
          },
        )}</b>`,
    );
    const ingredients = new Intl.ListFormat(this.localeManager.getLocale(), {
      type: 'conjunction',
    }).format(items);

    return this.translate.instant(step.bodyKey, {
      ...step.bodyParams,
      ingredients,
    });
  }
}
