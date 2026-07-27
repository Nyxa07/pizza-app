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
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';
import frCalculator from 'src/assets/i18n/fr/calculator.json';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { CalculatorTileComponent } from '../parts/calculator-tile.component';
import { CalculatorInitializerService } from '../services/calculator-initializer.service';
import { IntermediateDraftService } from '../services/intermediate-draft.service';
import { IntermediateFormComponent } from './intermediate-form.component';

/**
 * The Intermediate screen: the questions a pizza eater can answer, in the
 * order they are asked, over the real engine.
 */
describe('IntermediateFormComponent', () => {
  let fixture: ComponentFixture<IntermediateFormComponent>;
  let draft: IntermediateDraftService;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const tiles = (): CalculatorTileComponent[] =>
    fixture.debugElement
      .queryAll(By.directive(CalculatorTileComponent))
      .map((tile) => tile.componentInstance as CalculatorTileComponent);

  const tile = (labelKey: string) =>
    fixture.debugElement
      .queryAll(By.directive(CalculatorTileComponent))
      .find(
        (candidate) =>
          (candidate.componentInstance as CalculatorTileComponent).label() ===
          `calculator.intermediate.fields.${labelKey}`,
      );

  const step = (labelKey: string, direction: 'up' | 'down'): void => {
    const buttons = tile(labelKey)!.queryAll(By.css('.ctrl button'));
    (
      buttons[direction === 'up' ? 1 : 0].nativeElement as HTMLButtonElement
    ).click();
    fixture.detectChanges();
  };

  const chooseStyle = (pizzaType: PizzaType): void => {
    (
      host().querySelector(
        `[data-testid="pizza-type-${pizzaType}"]`,
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
  };

  const textOf = (testId: string): string =>
    host().querySelector(`[data-testid="${testId}"]`)!.textContent!.trim();

  const sizeTileText = (): string =>
    host().querySelector('[data-testid="size-tile"]')!.textContent!;

  const grams = (text: string): number => Number(text.replace(/\D/g, ''));

  const draftHolds = (
    partial: Parameters<IntermediateDraftService['update']>[0],
  ): void => {
    draft.update(partial);
    fixture.detectChanges();
  };

  // Loading a catalog is opt-in: the other specs match on raw translation
  // keys, which is what an empty catalog renders.
  const speaksFrench = (): void => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(Locales.FR, { calculator: frCalculator });
    translate.use(Locales.FR);
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IntermediateFormComponent],
      providers: [
        provideIonicAngular(),
        provideTranslateService({
          compiler: {
            provide: TranslateCompiler,
            useClass: TranslateMessageFormatCompiler,
          },
        }),
        provideRouter([]),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    TestBed.inject(CalculatorInitializerService).init(
      CalculatorPath.INTERMEDIATE,
    );
    draft = TestBed.inject(IntermediateDraftService);
    fixture = TestBed.createComponent(IntermediateFormComponent);
    fixture.detectChanges();
  }));

  it('asks its questions in the order the user reasons in', () => {
    const asked = tiles().map((instance) => instance.label());

    expect(asked).toEqual([
      'calculator.intermediate.fields.balls',
      'calculator.intermediate.fields.size',
      'calculator.intermediate.fields.doughType',
      'calculator.intermediate.fields.temperature',
      'calculator.intermediate.fields.yeastType',
    ]);
    // The style comes first, above the tiles, as plain-language choices.
    expect(host().querySelector('[data-testid="pizza-type-neapolitan"]'))
      .withContext('style choices')
      .toBeTruthy();
    // The rest slider sits between the dough type and the temperature.
    expect(host().querySelector('.rest ion-range')).toBeTruthy();
  });

  it('shows no salt, honey, olive oil or flour-strength control', () => {
    const labels = tiles().map((instance) => instance.label());

    for (const hidden of ['salt', 'honey', 'oliveOil', 'flourStrength']) {
      expect(labels.join(' ')).not.toContain(hidden);
    }
    expect(host().querySelector('details.advanced'))
      .withContext('no advanced section')
      .toBeNull();
  });

  it('derives the ball weight from the size the user picks', () => {
    // 28 cm Neapolitan out of the factory Defaults.
    expect(textOf('ball-weight')).toContain('250');

    step('size', 'up');

    expect(draft.getDraft().sizeCm).toBe(29);
    expect(textOf('ball-weight')).toContain('260');
    expect(sizeTileText()).toContain('260');
  });

  it('re-seats both the size and the weight when the style changes', () => {
    draftHolds({ pizzaType: PizzaType.NEAPOLITAN, sizeCm: 35 });
    expect(textOf('ball-weight')).toContain('340');

    chooseStyle(PizzaType.ROMAN);

    expect(draft.getDraft().sizeCm).toBe(33);
    expect(textOf('ball-weight')).toContain('210');
  });

  it('bounds the size stepper by the style', () => {
    draftHolds({ pizzaType: PizzaType.ROMAN, sizeCm: 33 });
    expect(tile('size')!.componentInstance.canStepUp()).toBeFalse();

    draftHolds({ pizzaType: PizzaType.NEAPOLITAN });
    // The same 33 cm is not the top of the Neapolitan range.
    expect(tile('size')!.componentInstance.canStepUp()).toBeTrue();

    draftHolds({ sizeCm: 26 });
    expect(tile('size')!.componentInstance.canStepDown()).toBeFalse();
  });

  it('recomputes the live result bar through the real engine on every edit', () => {
    const before = host().querySelector('.livebar .total')!.textContent!;

    step('balls', 'up');

    const after = host().querySelector('.livebar .total')!.textContent!;
    expect(grams(after)).toBeGreaterThan(grams(before));
  });

  it('rests entirely at room temperature below 24 h', () => {
    speaksFrench();
    draftHolds({ globalRestTime: 8 });

    expect(textOf('rest-split')).toBe("8\u00a0h à l'ambiante");
    expect(fixture.debugElement.query(By.css('app-calculator-timeline')))
      .withContext('fermentation timeline')
      .toBeTruthy();
  });

  it('splits ambient and cold on its own beyond 24 h', () => {
    speaksFrench();
    draftHolds({ globalRestTime: 36 });

    // The engine caps a direct dough at 24 ambient hours, the rest goes cold.
    expect(textOf('rest-split')).toBe('24\u00a0h ambiante + 12\u00a0h froid');
  });

  it('steps the rest slider one hour at a time, within its bounds', () => {
    draftHolds({ globalRestTime: 1 });
    const [down, up] = Array.from(
      host().querySelectorAll('.rest .calculator-stepper'),
    ) as HTMLButtonElement[];

    expect(down.disabled).withContext('at the lower bound').toBeTrue();

    up.click();
    fixture.detectChanges();

    expect(draft.getDraft().globalRestTime).toBe(2);

    draftHolds({ globalRestTime: 48 });
    expect(
      (
        host().querySelectorAll(
          '.rest .calculator-stepper',
        )[1] as HTMLButtonElement
      ).disabled,
    )
      .withContext('at the upper bound')
      .toBeTrue();
  });

  it('shows the hydration the style implies, without letting it be set', () => {
    const readOnly = host().querySelector('.read-only')!.textContent!;

    // 60.7 % Neapolitan at W270, rounded for display.
    expect(readOnly).toContain('61');
    expect(tile('hydration')).withContext('no hydration tile').toBeUndefined();
  });

  it('carries the contextual Fiches of the concepts it exposes', () => {
    const ids = fixture.debugElement
      .queryAll(By.directive(InfoSheetButtonComponent))
      .map((button) =>
        (button.componentInstance as InfoSheetButtonComponent).sheetId(),
      );

    expect(ids).toEqual(
      jasmine.arrayContaining([
        InfoSheetId.DIRECT,
        InfoSheetId.WARM_REST,
        InfoSheetId.COLD_REST,
        InfoSheetId.TEMPERATURE,
        InfoSheetId.YEASTS,
        InfoSheetId.HYDRATION,
      ]),
    );
  });

  it('persists every answer in its own Draft', () => {
    step('balls', 'up');
    step('size', 'up');
    chooseStyle(PizzaType.ROMAN);

    expect(draft.getDraft()).toEqual(
      jasmine.objectContaining({
        nbPizzas: 6,
        pizzaType: PizzaType.ROMAN,
      }),
    );
  });

  it('previews the Method and opens the Intermediate one', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    expect(
      host().querySelectorAll('app-calculator-method-preview .step').length,
    ).toBe(2);

    (host().querySelector('.calculator-cta') as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledWith([
      '/tabs/calculator/method/intermediate',
    ]);
  });
});
