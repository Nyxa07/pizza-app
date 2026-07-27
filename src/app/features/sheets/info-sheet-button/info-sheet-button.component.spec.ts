import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  ModalController,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { InfoSheetId } from '../enums/info-sheet-id.enum';
import { InfoSheetComponent } from '../info-sheet/info-sheet.component';
import { InfoSheetButtonComponent } from './info-sheet-button.component';

describe('InfoSheetButtonComponent', () => {
  it('opens the requested Fiche as a sheet modal', async () => {
    const modal = jasmine.createSpyObj<HTMLIonModalElement>('modal', [
      'present',
    ]);
    const modalController = jasmine.createSpyObj<ModalController>(
      'ModalController',
      ['create'],
    );
    modalController.create.and.resolveTo(modal);

    TestBed.configureTestingModule({
      imports: [InfoSheetButtonComponent],
      providers: [
        provideTranslateService(),
        { provide: ModalController, useValue: modalController },
      ],
    });
    const fixture = TestBed.createComponent(InfoSheetButtonComponent);
    fixture.componentRef.setInput('sheetId', InfoSheetId.TEMPERATURE);
    fixture.detectChanges();

    fixture.debugElement
      .query(By.css('ion-button'))
      .triggerEventHandler('click', new Event('click'));
    await fixture.whenStable();

    expect(modalController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        component: InfoSheetComponent,
        componentProps: { sheetId: InfoSheetId.TEMPERATURE },
      }),
    );
    expect(modal.present).toHaveBeenCalled();
  });
});

/**
 * The two shapes the button is written into: the fact grid of the Intermediate
 * screen, and plain running text. In both, it must follow the term it explains
 * — a block-level button drops onto its own line and then reads as if it
 * belonged to whatever comes next (#104).
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfoSheetButtonComponent],
  template: `
    <dl class="fact-grid">
      <div>
        <dt>Poids du pâton</dt>
        <dd class="num">130 g</dd>
      </div>
      <div>
        <dt>
          Hydratation
          <app-info-sheet-button [sheetId]="sheetId" />
        </dt>
        <dd class="num">55 %</dd>
      </div>
    </dl>
    <p class="prose">
      Hydratation
      <app-info-sheet-button [sheetId]="sheetId" />
    </p>
  `,
  styles: `
    // Narrow enough that a term and its ⓘ cannot share a half-width cell,
    // whatever font the runner has — the situation a phone reaches by way of
    // its font scale.
    .fact-grid {
      width: 220px;
    }
  `,
})
class InlineHostComponent {
  readonly sheetId = InfoSheetId.HYDRATION;
}

describe('InfoSheetButtonComponent beside the term it explains', () => {
  const TOLERANCE_PX = 0.5;
  let host: HTMLElement;
  let rootFontSize: string;

  const render = (scalePx = 16): void => {
    document.documentElement.style.fontSize = `${scalePx}px`;

    const fixture = TestBed.createComponent(InlineHostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    rootFontSize = document.documentElement.style.fontSize;
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular(),
        provideTranslateService(),
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj<ModalController>('ModalController', [
            'create',
          ]),
        },
      ],
    });
  });

  afterEach(() => {
    document.documentElement.style.fontSize = rootFontSize;
  });

  // The label is a bare text node, as it is in the real templates; a Range is
  // the only way to measure where it actually sits.
  const followsItsLabel = (container: string): void => {
    const term = host.querySelector(container)!;
    const range = document.createRange();
    range.selectNodeContents(term.firstChild!);
    const label = range.getBoundingClientRect();
    const button = term
      .querySelector('app-info-sheet-button')!
      .getBoundingClientRect();

    expect(button.left)
      .withContext(`${container}: after the label`)
      .toBeGreaterThanOrEqual(label.right - TOLERANCE_PX);
    expect(button.top)
      .withContext(`${container}: on the line of the label`)
      .toBeLessThan(label.bottom);
  };

  // The screen of #104: a fact grid too narrow to hold a term and its ⓘ in a
  // half-width cell. Rather than dropping the button under the word, the facts
  // read down one column, which gives the pair the room it needs.
  for (const [scale, scalePx] of [
    ['100%', 16],
    ['125%', 20],
    ['150%', 24],
  ] as const) {
    it(`stays on the line of a fact-grid term at ${scale}`, () => {
      render(scalePx);

      followsItsLabel('dl div:nth-child(2) dt');
    });
  }

  it('stays on the line of running text', () => {
    render();

    followsItsLabel('.prose');
  });
});
