import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import {
  TranslateCompiler,
  TranslateService,
  provideTranslateService,
} from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from 'src/app/features/sheets/info-sheet-button/info-sheet-button.component';
import { Locales } from 'src/app/features/settings/enums/locales.enum';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';
import enCalculator from 'src/assets/i18n/en/calculator.json';
import frCalculator from 'src/assets/i18n/fr/calculator.json';

import { DoughType } from '../enums/dough-type.enum';
import { CalculatorInitializerService } from '../services/calculator-initializer.service';
import { ExpertDraftService } from '../services/expert-draft.service';
import { ExpertFormComponent } from './expert-form.component';
import { ExpertTileComponent } from './parts/expert-tile.component';

/**
 * The Expert screen (issue #71): a dense instrument over its own Draft,
 * recomputing through the real engine on every edit.
 */
describe('ExpertFormComponent', () => {
  let fixture: ComponentFixture<ExpertFormComponent>;
  let state: ExpertDraftService;

  const tile = (labelKey: string) =>
    fixture.debugElement
      .queryAll(By.directive(ExpertTileComponent))
      .find(
        (t) =>
          (t.componentInstance as ExpertTileComponent).label() ===
          `calculator.expert.tiles.${labelKey}`,
      );

  const stepUp = (labelKey: string): void => {
    const buttons = tile(labelKey)!.queryAll(By.css('.ctrl button'));
    (buttons[1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  const livebarTotal = (): string =>
    (fixture.nativeElement as HTMLElement).querySelector('.livebar .total')!
      .textContent!;

  const livebarSplit = (): string =>
    (fixture.nativeElement as HTMLElement)
      .querySelector('.livebar .split')!
      .textContent!.trim();

  // Loading a catalog is opt-in: the other specs match tiles on their raw
  // translation keys, which is what an empty catalog renders.
  const speaks = (locale: Locales): void => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(locale, {
      calculator: locale === Locales.FR ? frCalculator : enCalculator,
    });
    translate.use(locale);
    fixture.detectChanges();
  };

  // These specs pin the wording, not the number format: the quantity is left
  // loose enough for whichever separators the locale-aware `number` pipe uses.
  const QUANTITY = '[\\d.,\\u00a0\\u202f ]+';

  const splitReads = (...ingredients: string[]): RegExp =>
    new RegExp(
      `^${ingredients.map((name) => `${QUANTITY}g ${name}`).join(' · ')}$`,
    );

  const renderedSheetIds = (): InfoSheetId[] =>
    fixture.debugElement
      .queryAll(By.directive(InfoSheetButtonComponent))
      .map((button) =>
        (button.componentInstance as InfoSheetButtonComponent).sheetId(),
      );

  const draftHolds = (partial: Parameters<ExpertDraftService['update']>[0]) => {
    state.update(partial);
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpertFormComponent],
      providers: [
        provideIonicAngular(),
        provideTranslateService({
          // The catalogs interpolate with MessageFormat (`{flour}`), so the
          // live bar only renders its real wording through that compiler.
          compiler: {
            provide: TranslateCompiler,
            useClass: TranslateMessageFormatCompiler,
          },
        }),
        provideRouter([]),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    TestBed.inject(CalculatorInitializerService).initExpert();
    state = TestBed.inject(ExpertDraftService);
    fixture = TestBed.createComponent(ExpertFormComponent);
    fixture.detectChanges();
  }));

  it('recomputes the pinned live bar through the real engine on every edit', () => {
    const grams = (text: string): number => Number(text.replace(/\D/g, ''));
    const before = livebarTotal();

    stepUp('balls');

    const after = livebarTotal();
    expect(after).not.toBe(before);
    expect(grams(after)).toBeGreaterThan(grams(before));
  });

  it('units every live bar quantity and capitalises the ingredients (fr)', () => {
    speaks(Locales.FR);

    expect(livebarSplit()).toMatch(
      splitReads('Farine', 'Eau', 'Sel', 'Levure'),
    );
  });

  it('units every live bar quantity and capitalises the ingredients (en)', () => {
    speaks(Locales.EN);

    expect(livebarSplit()).toMatch(
      splitReads('Flour', 'Water', 'Salt', 'Yeast'),
    );
  });

  it('carries the ⓘ Fiches on the concept tiles', () => {
    draftHolds({ doughType: DoughType.DIRECT });

    expect(renderedSheetIds()).toEqual(
      jasmine.arrayContaining([
        InfoSheetId.DIRECT,
        InfoSheetId.HYDRATION,
        InfoSheetId.TEMPERATURE,
        InfoSheetId.WARM_REST,
        InfoSheetId.COLD_REST,
        InfoSheetId.YEASTS,
      ]),
    );
  });

  it('follows the selected method: poolish surfaces the poolish Fiches and ratio tile', () => {
    draftHolds({ doughType: DoughType.POOLISH });

    const ids = renderedSheetIds();
    expect(ids).toContain(InfoSheetId.POOLISH);
    expect(ids).toContain(InfoSheetId.POOLISH_RATIO);
    expect(ids).not.toContain(InfoSheetId.DIRECT);
    expect(tile('poolishRatio')).toBeTruthy();
  });

  it('ships the advanced options folded (progressive disclosure)', () => {
    const details = (fixture.nativeElement as HTMLElement).querySelector(
      'details.advanced',
    ) as HTMLDetailsElement;

    expect(details.open).toBeFalse();
    expect(tile('salt')).toBeTruthy();
    expect(tile('flourStrength')).toBeTruthy();
  });

  it('previews the Method as two dated steps plus the full-method door', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(
      host.querySelectorAll('app-expert-method-preview .step').length,
    ).toBe(2);
    expect(host.querySelector('app-expert-method-preview .more')).toBeTruthy();
    expect(host.querySelector('.cta')).toBeTruthy();
  });

  it('opens the Expert Method explicitly', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    (fixture.nativeElement.querySelector('.cta') as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledWith([
      '/tabs/calculator/method/expert',
    ]);
  });

  it('shows the engine-effective rest split when Expert holds a global rest', () => {
    draftHolds({
      doughType: DoughType.POOLISH,
      globalRestTime: 24,
      rtRestTime: null,
      coldRestTime: null,
    });

    // The engine splits 24 h of poolish rest into 1 h ambient + 23 h cold.
    expect(tile('ambientRest')!.nativeElement.textContent).toContain('1');
    expect(tile('coldRest')!.nativeElement.textContent).toContain('23');
  });

  it('editing a rest tile pins both rests and drops the global rest', () => {
    draftHolds({
      doughType: DoughType.POOLISH,
      globalRestTime: 24,
      rtRestTime: null,
      coldRestTime: null,
    });

    stepUp('ambientRest');

    const input = state.getInput();
    expect(input.rtRestTime).toBe(2);
    expect(input.coldRestTime).toBe(23);
    expect(input.globalRestTime).toBeNull();
  });
});
