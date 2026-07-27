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
 * One parametric tile of a calculator grid (variant D): uppercase label, big
 * tabular value with its unit, an optional caption and − / + steppers — or,
 * when no `value` is given, a projected select for enum fields. Shared by the
 * Expert and Intermediate screens so the two can never drift apart.
 */
@Component({
  selector: 'app-calculator-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfoSheetButtonComponent, TranslatePipe],
  // A tile whose reading matters to a screen reader announces itself as one
  // group carrying its current value and unit, rather than as loose text.
  host: {
    '[attr.role]': 'ariaLabel() ? "group" : null',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `
    <div class="label">
      <span>{{ label() }}</span>
      @if (sheetId(); as sheet) {
        <app-info-sheet-button [sheetId]="sheet" />
      }
    </div>
    <div class="content">
      @if (value() !== null) {
        <div class="value num">
          <!-- One reading, one box: the unit can never be laid out apart from
               the number it qualifies. -->
          <span class="reading"
            >{{ value() }}
            @if (unit(); as u) {
              <small>{{ u }}</small>
            }
          </span>
        </div>
        <div class="ctrl">
          <button
            type="button"
            [disabled]="!canStepDown()"
            (click)="stepDown.emit()"
            [attr.aria-label]="
              ('calculator.shared.tiles.decrease' | translate) + ' ' + label()
            "
          >
            −
          </button>
          <button
            type="button"
            [disabled]="!canStepUp()"
            (click)="stepUp.emit()"
            [attr.aria-label]="
              ('calculator.shared.tiles.increase' | translate) + ' ' + label()
            "
          >
            +
          </button>
        </div>
      } @else {
        <div class="value select"><ng-content /></div>
      }
    </div>
    <div class="caption num">{{ caption() }}</div>
  `,
  styles: `
    :host {
      --stepper-size: 38px;

      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      // Three stacked rows. The label row stays at its own height so the gap
      // below it never stretches; the content row takes the slack when a
      // neighbour tile makes the tile taller, and never collapses below a
      // stepper; the caption row is reserved in every tile — including the
      // select ones — so two neighbouring tiles read their big numbers on the
      // same line whether or not they carry a caption (#104).
      grid-template-rows: auto minmax(var(--stepper-size), 1fr) auto;
      background: var(--surface);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-m);
      padding: 12px 12px 10px;
      box-shadow: var(--shadow);
    }

    .label {
      display: flex;
      align-items: center;
      gap: 2px;
      // Guaranteed breathing room under the label, whatever the tile width or
      // the height of its neighbours (#92).
      margin-bottom: 12px;
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

    // The reading and its steppers share one line. When the font scale of the
    // device leaves them too little room, the steppers drop below the value
    // rather than squeezing it — the number is what the user came to read.
    //
    // Anchored to the top of its row, never centred in it: the value then sits
    // a constant 12px under its own label, so two neighbouring tiles read on
    // the same line whether one of them carries a caption or has had to fold
    // its steppers (#104). What is left of a stretched tile shows as space
    // below, which is the honest place for it.
    .content {
      align-self: start;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: 6px;
      row-gap: 8px;
      min-width: 0;
    }

    .caption {
      margin-top: 2px;
      // Reserved even when empty, and never wrapped: the row must measure the
      // same in every tile of a grid for the values above it to line up.
      min-height: 1.3em;
      line-height: 1.3;
      white-space: nowrap;
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--ink-2);
    }

    // As tall as a stepper, with the reading centred in it: the value then
    // starts at the same height whether its steppers sit beside it or have
    // folded below, which is what keeps two neighbouring tiles in line.
    .value {
      display: flex;
      align-items: center;
      min-height: var(--stepper-size);
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

    .reading {
      // A reading never breaks between its number and its unit (#104).
      white-space: nowrap;
    }

    // The projected-select variant stands alone on the content row, and reads
    // as a sentence — so it may wrap where a numeric value may not.
    .value.select {
      flex: 1;
      min-width: 0;
      font-size: 1.05rem;
      font-weight: 600;
    }

    // Below the width where a reading and its steppers fit side by side, every
    // tile of the grid folds at once — a tile that folded alone would leave a
    // gaping hole in the one beside it. A reading needs about 64px and the
    // steppers 80px, and each tile spends 26px on padding and borders, which
    // puts the grid's floor at 2 × 150 + 62 ≈ 368px. Font-relative units are
    // no help here: a container query resolves em and rem against the initial
    // font size, not the current one — so this stays in px, and the wrapping
    // content row below catches the tile that runs out of room on its own.
    @container (max-width: 368px) {
      .content {
        flex-direction: column;
        align-items: flex-start;
      }

      .value.select {
        flex: none;
        width: 100%;
      }
    }

    .ctrl {
      // Stays flush right, on the wrapped line too.
      margin-left: auto;
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
export class CalculatorTileComponent {
  readonly label = input.required<string>();
  readonly value = input<string | null>(null);
  readonly unit = input<string | null>(null);
  /** A derived reading under the value, e.g. the size a weight amounts to. */
  readonly caption = input<string | null>(null);
  /** Spoken name of the tile, value and unit included. */
  readonly ariaLabel = input<string | null>(null);
  readonly sheetId = input<InfoSheetId | null>(null);
  readonly canStepUp = input(true);
  readonly canStepDown = input(true);

  readonly stepUp = output<void>();
  readonly stepDown = output<void>();
}
