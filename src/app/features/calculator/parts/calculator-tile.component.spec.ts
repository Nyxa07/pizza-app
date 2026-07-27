import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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

/**
 * The pair of tiles the Intermediate screen puts side by side: a bare count,
 * and a size carrying both a unit and a caption. Short labels of equal length
 * keep the measurement on what is under test — a caption on one side only must
 * not shift the reading — rather than on where a long label happens to wrap.
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalculatorTileComponent],
  template: `
    <div class="grid" [style.width.px]="width()">
      <app-calculator-tile class="plain-tile" label="Pâtons" value="5" />
      <app-calculator-tile
        class="unit-tile"
        label="Taille"
        value="26"
        unit="cm"
        caption="130 g"
      />
    </div>
  `,
  styles: `
    // Mirrors .grid in intermediate-form.component.scss, container included:
    // that is what makes the tiles of a grid fold together.
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      container-type: inline-size;
    }
  `,
})
class IntermediatePairHostComponent {
  readonly width = signal(328);
}

const provideTileDependencies = (): void => {
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
};

const rectIn = (host: HTMLElement, selector: string): DOMRect => {
  const element = host.querySelector(selector);
  if (!element) {
    throw new Error(`Missing "${selector}" in the tile grid`);
  }

  return element.getBoundingClientRect();
};

describe('CalculatorTileComponent', () => {
  let host: HTMLElement;

  beforeEach(() => {
    provideTileDependencies();

    const fixture = TestBed.createComponent(TileGridHostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  const rect = (selector: string): DOMRect => rectIn(host, selector);

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

/**
 * A tile must read the same whatever font scale the device applies (#104). The
 * root font size stands in for that scale: every type size in the tile is in
 * `rem` while the steppers keep their pixel footprint, so raising it squeezes
 * the room left for the reading exactly as an enlarged system font does.
 */
describe('CalculatorTileComponent under a device font scale', () => {
  const PHONE_GRID_PX = 328; // a 360px viewport minus the page inset
  let host: HTMLElement;
  let rootFontSize: string;

  beforeEach(() => {
    rootFontSize = document.documentElement.style.fontSize;
    provideTileDependencies();
  });

  afterEach(() => {
    document.documentElement.style.fontSize = rootFontSize;
  });

  const renderPair = (scalePx: number, gridWidthPx = PHONE_GRID_PX): void => {
    document.documentElement.style.fontSize = `${scalePx}px`;

    const fixture = TestBed.createComponent(IntermediatePairHostComponent);
    fixture.componentInstance.width.set(gridWidthPx);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  };

  const rect = (selector: string): DOMRect => rectIn(host, selector);

  // A reading that kept its unit on its line is exactly as tall as a reading
  // with no unit to lose; a wrapped one is twice that.
  const readsOnOneLine = (): boolean =>
    Math.abs(
      rect('.unit-tile .reading').height - rect('.plain-tile .reading').height,
    ) < TOLERANCE_PX;

  for (const [scale, scalePx] of [
    ['100%', 16],
    ['125%', 20],
    ['150%', 24],
  ] as const) {
    it(`keeps the unit on the line of its value at ${scale}`, () => {
      renderPair(scalePx);

      expect(readsOnOneLine()).toBeTrue();
    });

    it(`never lets the steppers sit over the value at ${scale}`, () => {
      renderPair(scalePx);
      const value = rect('.unit-tile .value');
      const ctrl = rect('.unit-tile .ctrl');

      // Beside the reading, or below it — never on top of it.
      expect(
        ctrl.left >= value.right - TOLERANCE_PX ||
          ctrl.top >= value.bottom - TOLERANCE_PX,
      ).toBeTrue();
    });

    it(`lines up the values of two neighbouring tiles at ${scale}`, () => {
      renderPair(scalePx);

      // The caption of the size tile has its own reserved row, so it no longer
      // pushes the reading above it out of line with the tile next door.
      expect(rect('.unit-tile .value').top).toBeCloseTo(
        rect('.plain-tile .value').top,
        0,
      );
    });
  }

  it('drops the steppers below the value when the tile runs out of room', () => {
    renderPair(20, 240);

    expect(rect('.unit-tile .ctrl').top).toBeGreaterThanOrEqual(
      rect('.unit-tile .value').bottom - TOLERANCE_PX,
    );
    expect(readsOnOneLine()).withContext('the reading stays whole').toBeTrue();
  });
});
