import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from 'src/app/features/sheets/info-sheet-button/info-sheet-button.component';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughType } from '../enums/dough-type.enum';
import { CalculatorInitializerService } from '../services/calculator-initializer.service';
import { CalculatorStateService } from '../services/calculator-state.service';
import { ExpertFormComponent } from './expert-form.component';
import { ExpertTileComponent } from './parts/expert-tile.component';

/**
 * The Expert screen (issue #71): a dense instrument over the single shared
 * Draft, recomputing through the real engine on every edit.
 */
describe('ExpertFormComponent', () => {
  let fixture: ComponentFixture<ExpertFormComponent>;
  let state: CalculatorStateService;

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

  const renderedSheetIds = (): InfoSheetId[] =>
    fixture.debugElement
      .queryAll(By.directive(InfoSheetButtonComponent))
      .map((button) =>
        (button.componentInstance as InfoSheetButtonComponent).sheetId(),
      );

  const draftHolds = (
    partial: Parameters<CalculatorStateService['update']>[0],
  ) => {
    state.update(partial);
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpertFormComponent],
      providers: [
        provideIonicAngular(),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    TestBed.inject(CalculatorInitializerService).initExpert();
    state = TestBed.inject(CalculatorStateService);
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

  it('shows the engine-effective rest split when the Draft only holds a Guided global rest', () => {
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

  it('editing a rest tile pins both rests and drops the Guided global rest', () => {
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
