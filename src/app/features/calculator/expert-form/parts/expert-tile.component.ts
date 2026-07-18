import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from 'src/app/features/sheets/info-sheet-button/info-sheet-button.component';

/**
 * One parametric tile of the Expert grid (variant D): uppercase label, big
 * tabular value with its unit and − / + steppers — or, when no `value` is
 * given, a projected select for enum fields.
 */
@Component({
  selector: 'app-expert-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfoSheetButtonComponent, TranslatePipe],
  template: `
    <div class="label">
      <span>{{ label() }}</span>
      @if (sheetId(); as sheet) {
        <app-info-sheet-button [sheetId]="sheet" />
      }
    </div>
    @if (value() !== null) {
      <div class="value num">
        {{ value() }}
        @if (unit(); as u) {
          <small>{{ u }}</small>
        }
      </div>
      <div class="ctrl">
        <button
          type="button"
          (click)="stepDown.emit()"
          [attr.aria-label]="
            ('calculator.expert.tiles.decrease' | translate) + ' ' + label()
          "
        >
          −
        </button>
        <button
          type="button"
          (click)="stepUp.emit()"
          [attr.aria-label]="
            ('calculator.expert.tiles.increase' | translate) + ' ' + label()
          "
        >
          +
        </button>
      </div>
    } @else {
      <div class="value select"><ng-content /></div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      background: var(--surface);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-m);
      padding: 12px 14px 10px;
      box-shadow: var(--shadow);
    }

    .label {
      display: flex;
      align-items: center;
      gap: 2px;
      min-height: 18px;
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--ink-2);

      app-info-sheet-button {
        margin: -8px 0;
      }
    }

    .value {
      padding: 4px 0 2px;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--ink);

      small {
        margin-left: 2px;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--ink-2);
      }
    }

    .value.select {
      padding-top: 8px;
      font-size: 1.05rem;
      font-weight: 600;
    }

    .ctrl {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 6px;

      button {
        width: 26px;
        height: 26px;
        padding: 0;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-s);
        background: var(--surface-sunken);
        color: var(--ink-2);
        font: inherit;
        font-size: 0.95rem;
        line-height: 1;
        cursor: pointer;
      }
    }
  `,
})
export class ExpertTileComponent {
  readonly label = input.required<string>();
  readonly value = input<string | null>(null);
  readonly unit = input<string | null>(null);
  readonly sheetId = input<InfoSheetId | null>(null);

  readonly stepUp = output<void>();
  readonly stepDown = output<void>();
}
