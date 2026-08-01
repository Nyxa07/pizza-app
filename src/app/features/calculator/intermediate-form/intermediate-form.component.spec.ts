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
import type { IIntermediateCalculatorDraft } from '../interfaces/intermediate-calculator-draft.interface';
import { CalculatorPaths } from '../paths/calculator-paths.service';
import type { PathDraft } from '../paths/path-draft.interface';
import { IntermediateFormComponent } from './intermediate-form.component';

/**
 * The Intermediate screen: the questions a pizza eater can answer, in the
 * order they are asked, over the real engine.
 */
describe('IntermediateFormComponent', () => {
  let fixture: ComponentFixture<IntermediateFormComponent>;
  let draft: PathDraft<IIntermediateCalculatorDraft>;

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

  /**
   * The block that carries the style choices — found through them, so that
   * asking what else it holds is a real question.
   */
  const styleSection = (): HTMLElement =>
    host().querySelector('.choice')!.closest('section')!;

  /**
   * What makes a block read as a card on this screen — stated as what the eye
   * sees, never as the token or the rule that produces it, so the technique
   * can change without the test moving.
   */
  interface BlockTreatment {
    border: string;
    radius: string;
    background: string;
    shadow: string;
  }

  const blockTreatment = (element: Element): BlockTreatment => {
    const style = getComputedStyle(element);
    return {
      border: `${style.borderTopWidth} ${style.borderTopStyle}`,
      radius: style.borderTopLeftRadius,
      background: style.backgroundColor,
      shadow: style.boxShadow,
    };
  };

  const sizeTileText = (): string =>
    host().querySelector('[data-testid="size-tile"]')!.textContent!;

  const grams = (text: string): number => Number(text.replace(/\D/g, ''));

  const draftHolds = (partial: Partial<IIntermediateCalculatorDraft>): void => {
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

    draft = TestBed.inject(CalculatorPaths).for(CalculatorPath.INTERMEDIATE);
    fixture = TestBed.createComponent(IntermediateFormComponent);
    fixture.detectChanges();
  }));

  it('asks its questions in the order the user reasons in', () => {
    const asked = tiles().map((instance) => instance.label());

    expect(asked).toEqual([
      'calculator.intermediate.fields.balls',
      'calculator.intermediate.fields.size',
      'calculator.intermediate.fields.doughType',
      'calculator.intermediate.fields.yeastType',
      'calculator.intermediate.fields.restTime',
      'calculator.intermediate.fields.temperature',
    ]);
    // The style comes first, above the tiles, as plain-language choices.
    expect(host().querySelector('[data-testid="pizza-type-neapolitan"]'))
      .withContext('style choices')
      .toBeTruthy();
    // Every answer below the style is a tile of a two-column row: the rest
    // slider that stood alone in a full-width block is gone (#120).
    expect(host().querySelector('ion-range')).toBeNull();
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

    expect(draft.snapshot().sizeCm).toBe(29);
    expect(textOf('ball-weight')).toContain('260');
    expect(sizeTileText()).toContain('260');
  });

  it('re-seats both the size and the weight when the style changes', () => {
    draftHolds({ pizzaType: PizzaType.NEAPOLITAN, sizeCm: 35 });
    expect(textOf('ball-weight')).toContain('340');

    chooseStyle(PizzaType.ROMAN);

    expect(draft.snapshot().sizeCm).toBe(33);
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

  it('steps the rest one hour at a time, within its bounds', () => {
    draftHolds({ globalRestTime: 1 });

    expect(tile('restTime')!.componentInstance.canStepDown())
      .withContext('at the lower bound')
      .toBeFalse();

    step('restTime', 'up');

    expect(draft.snapshot().globalRestTime).toBe(2);

    draftHolds({ globalRestTime: 48 });
    expect(tile('restTime')!.componentInstance.canStepUp())
      .withContext('at the upper bound')
      .toBeFalse();
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
        InfoSheetId.REST,
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

    expect(draft.snapshot()).toEqual(
      jasmine.objectContaining({
        nbPizzas: 6,
        pizzaType: PizzaType.ROMAN,
      }),
    );
  });

  // The first question of the path is a question posed in a frame, like every
  // other block of the screen — issue #107.
  describe('the style question', () => {
    it('gathers its label, its hint and both choices under one block', () => {
      const framed = styleSection();

      expect(framed.querySelector('#intermediate-pizzaType'))
        .withContext('the label')
        .toBeTruthy();
      expect(framed.querySelector('.field-hint'))
        .withContext('the hint')
        .toBeTruthy();
      expect(framed.querySelectorAll('[data-testid^="pizza-type-"]').length)
        .withContext('both style choices')
        .toBe(2);
    });

    it('presents itself as a card, like every other block of the screen', () => {
      const tile = host().querySelector('app-calculator-tile')!;

      // Anchored on the shared tile, which frames itself: the style question
      // is now the only block of the screen that is not one.
      expect(blockTreatment(styleSection()))
        .withContext('against the shared tile')
        .toEqual(blockTreatment(tile));
      expect(getComputedStyle(styleSection()).paddingTop)
        .withContext('the inner spacing of a block')
        .toBe(getComputedStyle(tile).paddingTop);
    });

    it('keeps each style card distinguishable from the block carrying it', () => {
      const carrier = getComputedStyle(styleSection()).backgroundColor;

      for (const choice of Array.from(
        styleSection().querySelectorAll('.choice'),
      )) {
        expect(getComputedStyle(choice).backgroundColor)
          .withContext(choice.getAttribute('data-testid')!)
          .not.toBe(carrier);
      }
    });

    it('still names each style and says what it gives', () => {
      speaksFrench();
      const framed = styleSection().textContent!;

      expect(framed).toContain('Type de pizza');
      expect(framed).toContain("Le style décide de l'hydratation");
      expect(framed).toContain('Napolitaine');
      expect(framed).toContain('Souple, gonflée et moelleuse');
      expect(framed).toContain('Romaine');
      expect(framed).toContain('Fine, légère et croustillante');
    });
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
