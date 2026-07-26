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
          [disabled]="!canStepDown()"
          (click)="stepDown.emit()"
          [attr.aria-label]="
            ('calculator.expert.tiles.decrease' | translate) + ' ' + label()
          "
        >
          −
        </button>
        <button
          type="button"
          [disabled]="!canStepUp()"
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
      --stepper-size: 38px;

      position: relative;
      display: grid;
      grid-template-areas:
        'label label'
        'value controls';
      grid-template-columns: minmax(0, 1fr) auto;
      // The label row stays at its own height so the gap below it never
      // stretches; the content row takes the slack when a neighbour tile makes
      // the row taller, and never collapses below a stepper.
      grid-template-rows: auto minmax(var(--stepper-size), 1fr);
      column-gap: 6px;
      // Guaranteed breathing room under the label, whatever the tile width or
      // the height of its neighbours (#92).
      row-gap: 12px;
      background: var(--surface);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-m);
      padding: 12px 12px 10px;
      box-shadow: var(--shadow);
    }

    .label {
      grid-area: label;
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
      grid-area: value;
      align-self: center;
      min-width: 0;
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
      font-size: 1.05rem;
      font-weight: 600;
    }

    .ctrl {
      grid-area: controls;
      align-self: center;
      display: flex;
      gap: 4px;

      button {
        width: var(--stepper-size);
        height: var(--stepper-size);
        padding: 0;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-s);
        background: var(--surface-sunken);
        color: var(--ink-2);
        font: inherit;
        font-size: 1.05rem;
        line-height: 1;
        cursor: pointer;
        transition:
          transform 0.08s ease,
          border-color 0.15s ease,
          color 0.15s ease;

        @media (hover: hover) and (pointer: fine) {
          &:hover:not(:disabled) {
            border-color: var(--ink-3);
            color: var(--ink);
          }
        }

        &:active:not(:disabled) {
          transform: scale(0.92);
        }

        &:disabled {
          opacity: 0.35;
          cursor: default;
        }
      }
    }
  `,
})
export class ExpertTileComponent {
  readonly label = input.required<string>();
  readonly value = input<string | null>(null);
  readonly unit = input<string | null>(null);
  readonly sheetId = input<InfoSheetId | null>(null);
  readonly canStepUp = input(true);
  readonly canStepDown = input(true);

  readonly stepUp = output<void>();
  readonly stepDown = output<void>();
}
