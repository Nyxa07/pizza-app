import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

/**
 * The fermentation timeline of the Expert screen: two proportional
 * segments, warm ambient rest then cold retard, labelled in hours.
 */
@Component({
  selector: 'app-expert-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="labels num">
      <span>{{
        'calculator.expert.timeline.ambient'
          | translate: { hours: ambientHours() }
      }}</span>
      @if (coldHours() > 0) {
        <span>{{
          'calculator.expert.timeline.cold' | translate: { hours: coldHours() }
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
      border-radius: 6px;
    }

    .ambient {
      background: var(--accent);
      opacity: 0.85;
    }

    .cold {
      background: var(--surface-sunken);
    }
  `,
})
export class ExpertTimelineComponent {
  readonly ambientHours = input.required<number>();
  readonly coldHours = input.required<number>();
}
