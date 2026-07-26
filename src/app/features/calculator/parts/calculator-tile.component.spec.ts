import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ModalController } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';

import { CalculatorTileComponent } from './calculator-tile.component';

/**
 * Every tile must let its label breathe above the content it names — a value
 * with steppers, or a projected select — including when a taller neighbour
 * stretches the tile (#92). Measured in CSS pixels, with a sub-pixel tolerance
 * for layout rounding.
 */
const MIN_LABEL_GAP_PX = 12;
const TOLERANCE_PX = 0.5;

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalculatorTileComponent],
  template: `
    <div class="grid">
      <app-calculator-tile
        class="stepper-tile"
        label="Hydratation"
        value="65"
        unit="%"
        [sheetId]="sheetId"
      />
      <app-calculator-tile class="select-tile" label="Type de pâte">
        <span class="projected">Napolitaine</span>
      </app-calculator-tile>
      <app-calculator-tile
        class="tall-tile"
        label="Poids"
        value="260"
        unit="g"
      />
      <app-calculator-tile class="stretched-tile" label="Pâtons" value="6" />
    </div>
  `,
  styles: `
    // Mirrors .grid in expert-form.component.scss at a 360px viewport: two
    // stretched columns, so a tall tile stretches the one beside it just as a
    // wrapping value does on the real screen.
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      width: 328px;
    }

    .tall-tile {
      min-height: 160px;
    }
  `,
})
class TileGridHostComponent {
  readonly sheetId = InfoSheetId.HYDRATION;
}

describe('CalculatorTileComponent', () => {
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj<ModalController>('ModalController', [
            'create',
          ]),
        },
      ],
    });

    const fixture = TestBed.createComponent(TileGridHostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  const rect = (selector: string): DOMRect => {
    const element = host.querySelector(selector);
    if (!element) {
      throw new Error(`Missing "${selector}" in the tile grid`);
    }

    return element.getBoundingClientRect();
  };

  const gapBelowLabel = (tile: string, content: string): number =>
    rect(`${tile} ${content}`).top - rect(`${tile} .label`).bottom;

  it('keeps the label clear of the value and of the steppers', () => {
    expect(gapBelowLabel('.stepper-tile', '.value')).toBeGreaterThanOrEqual(
      MIN_LABEL_GAP_PX - TOLERANCE_PX,
    );
    expect(
      gapBelowLabel('.stepper-tile', '.ctrl button'),
    ).toBeGreaterThanOrEqual(MIN_LABEL_GAP_PX - TOLERANCE_PX);
  });

  it('keeps the label clear of a projected select', () => {
    expect(gapBelowLabel('.select-tile', '.projected')).toBeGreaterThanOrEqual(
      MIN_LABEL_GAP_PX - TOLERANCE_PX,
    );
  });

  it('keeps the gap under the label when a neighbour stretches the tile', () => {
    expect(
      gapBelowLabel('.stretched-tile', '.ctrl button'),
    ).toBeGreaterThanOrEqual(MIN_LABEL_GAP_PX - TOLERANCE_PX);
    // The slack goes to the content row, so the label keeps its own height
    // instead of drifting down the tile.
    expect(rect('.stretched-tile .label').height).toBeCloseTo(
      rect('.tall-tile .label').height,
      0,
    );
  });
});
