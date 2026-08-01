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

import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { DoughType } from '../enums/dough-type.enum';
import type { ICalculatorInput } from '../interfaces/calculator-input.interface';
import { CalculatorPaths } from '../paths/calculator-paths.service';
import type { PathDraft } from '../paths/path-draft.interface';
import { ExpertFormComponent } from './expert-form.component';
import { CalculatorTileComponent } from '../parts/calculator-tile.component';

/**
 * The Expert screen (issue #71): a dense instrument over its own Draft,
 * recomputing through the real engine on every edit.
 */
describe('ExpertFormComponent', () => {
  let fixture: ComponentFixture<ExpertFormComponent>;
  let state: PathDraft<ICalculatorInput>;

  const tile = (labelKey: string) =>
    fixture.debugElement
      .queryAll(By.directive(CalculatorTileComponent))
      .find(
        (t) =>
          (t.componentInstance as CalculatorTileComponent).label() ===
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

  // A quantity never breaks away from its unit, nor the unit from what it
  // weighs: the live bar may wrap, but only at the separators (#104).
  const splitReads = (...ingredients: string[]): RegExp =>
    new RegExp(
      `^${ingredients
        .map((name) => `${QUANTITY}\\u00a0g\\u00a0${name}`)
        .join(' · ')}$`,
    );

  const renderedSheetIds = (): InfoSheetId[] =>
    fixture.debugElement
      .queryAll(By.directive(InfoSheetButtonComponent))
      .map((button) =>
        (button.componentInstance as InfoSheetButtonComponent).sheetId(),
      );

  const draftHolds = (partial: Partial<ICalculatorInput>) => {
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

    state = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);
    fixture = TestBed.createComponent(ExpertFormComponent);
    fixture.detectChanges();
  }));

  /** By test id, so a loaded catalog cannot hide the tile from the query. */
  const tileByTestId = (testId: string) =>
    fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));

  const weightTileText = (): string =>
    tileByTestId('weight-tile').nativeElement.textContent as string;

  const stepUpWeight = (): void => {
    const buttons = tileByTestId('weight-tile').queryAll(
      By.css('.ctrl button'),
    );
    (buttons[1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  const choosePizzaType = (pizzaType: PizzaType): void => {
    const select = tileByTestId('pizza-type-tile').query(By.css('ion-select'))
      .nativeElement as HTMLIonSelectElement;
    select.value = pizzaType;
    select.dispatchEvent(
      new CustomEvent('ionChange', { detail: { value: pizzaType } }),
    );
    fixture.detectChanges();
  };

  it('reads the ball weight back as the pizza size it makes', () => {
    speaks(Locales.FR);

    // 250 g of factory Default is a 28 cm Neapolitan.
    expect(weightTileText()).toContain('250');
    expect(weightTileText()).toContain('28');

    stepUpWeight();

    expect(weightTileText()).toContain('260');
    expect(weightTileText()).toContain('29');
  });

  it('bounds the weight stepper by the current style', () => {
    draftHolds({ pizzaType: PizzaType.NEAPOLITAN, pizzaWeight: 340 });
    expect(
      (
        tileByTestId('weight-tile').componentInstance as CalculatorTileComponent
      ).canStepUp(),
    )
      .withContext('top of the Neapolitan range')
      .toBeFalse();

    draftHolds({ pizzaType: PizzaType.NEAPOLITAN, pizzaWeight: 220 });
    expect(
      (
        tileByTestId('weight-tile').componentInstance as CalculatorTileComponent
      ).canStepDown(),
    ).toBeFalse();
  });

  it('re-seats the weight in the new style when the style changes', () => {
    speaks(Locales.FR);
    draftHolds({ pizzaType: PizzaType.NEAPOLITAN, pizzaWeight: 340 });

    choosePizzaType(PizzaType.ROMAN);

    expect(state.snapshot().pizzaWeight).toBe(210);
    expect(weightTileText()).toContain('210');
    expect(weightTileText()).toContain('33');
  });

  it('opens a Draft persisted outside the style on its nearest bound', () => {
    // What a Draft written before the bounds existed still holds.
    draftHolds({ pizzaType: PizzaType.ROMAN, pizzaWeight: 400 });

    expect(state.snapshot().pizzaWeight).toBe(210);
    expect(weightTileText()).toContain('210');
  });

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
        InfoSheetId.REST,
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
      host.querySelectorAll('app-calculator-method-preview .step').length,
    ).toBe(2);
    expect(
      host.querySelector('app-calculator-method-preview .more'),
    ).toBeTruthy();
    expect(host.querySelector('.calculator-cta')).toBeTruthy();
  });

  it('opens the Expert Method explicitly', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    (
      fixture.nativeElement.querySelector(
        '.calculator-cta',
      ) as HTMLButtonElement
    ).click();

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

    const input = state.snapshot();
    expect(input.rtRestTime).toBe(2);
    expect(input.coldRestTime).toBe(23);
    expect(input.globalRestTime).toBeNull();
  });
});
