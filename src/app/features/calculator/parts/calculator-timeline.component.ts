import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

/**
 * The fermentation timeline of the Expert screen: two proportional
 * segments, warm ambient rest then cold retard, labelled in hours.
 */
@Component({
  selector: 'app-calculator-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="labels num">
      <span>{{
        'calculator.shared.timeline.ambient'
          | translate: { hours: ambientHours() }
      }}</span>
      @if (coldHours() > 0) {
        <span>{{
          'calculator.shared.timeline.cold' | translate: { hours: coldHours() }
        }}</span>
      }
    </div>
    <div class="bar" aria-hidden="true">
      <span class="ambient" [style.flex-grow]="ambientHours()"></span>
      <span class="cold" [style.flex-grow]="coldHours()"></span>
    </div>
  `,
  styles: `
    .labels {
      display: flex;
      justify-content: space-between;
      padding-bottom: 5px;
      font-size: 0.7rem;
      color: var(--ink-2);
    }

    .bar {
      display: flex;
      height: 10px;
      overflow: hidden;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-s);
    }

    .ambient {
      background: color-mix(in srgb, var(--accent) 85%, var(--surface));
    }

    .cold {
      background: color-mix(in srgb, var(--ink) 15%, var(--surface));
    }
  `,
})
export class CalculatorTimelineComponent {
  readonly ambientHours = input.required<number>();
  readonly coldHours = input.required<number>();
}
