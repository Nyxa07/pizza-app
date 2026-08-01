import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughSaverComponent } from '../../doughs/dough-saver/dough-saver.component';
import { InfoSheetId } from '../../sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from '../../sheets/info-sheet-button/info-sheet-button.component';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { CalculatorPath } from '../enums/calculator-path.enum';
import { GUIDED_STEP_STORAGE_KEY } from '../paths/calculator-draft-storage.constants';
import { CalculatorPaths } from '../paths/calculator-paths.service';
import { GUIDED_PATH } from '../paths/guided.path';
import type { GuidedPathDraft } from '../paths/path-draft.interface';
import { DoughDefaultsService } from '../services/dough-defaults.service';
import { GuidedFormComponent } from './guided-form.component';

/** Seven steps since the flour question left the path (issue #99). */
const GUIDED_STEP_COUNT = 7;

describe('GuidedFormComponent', () => {
  let fixture: ComponentFixture<GuidedFormComponent>;
  let draft: GuidedPathDraft;
  let prefs: FakePrefsStorage;

  /** The Guided input, resolved the way the path definition resolves it. */
  const resolvedInput = () =>
    GUIDED_PATH.toInput(
      draft.snapshot(),
      TestBed.inject(DoughDefaultsService).getDefaults(),
    );

  const next = (): void => {
    const button = fixture.debugElement.query(
      By.css('[data-testid="next-step"]'),
    );
    (button.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  /** The last step, reached the way a user does: one answer at a time. */
  const goToSummary = (): void => {
    for (let step = 0; step < GUIDED_STEP_COUNT - 1; step += 1) {
      next();
    }
  };

  const currentStepId = (): string =>
    fixture.nativeElement
      .querySelector('.question h1')
      ?.id.replace('guided-question-', '') ?? '';

  const renderedSheetIds = (): InfoSheetId[] =>
    fixture.debugElement
      .queryAll(By.directive(InfoSheetButtonComponent))
      .map((button) =>
        (button.componentInstance as InfoSheetButtonComponent).sheetId(),
      );

  beforeEach(waitForAsync(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      imports: [GuidedFormComponent],
      providers: [
        provideIonicAngular(),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: prefs },
      ],
    }).compileComponents();

    draft = TestBed.inject(CalculatorPaths).for(CalculatorPath.GUIDED);
    fixture = TestBed.createComponent(GuidedFormComponent);
    fixture.detectChanges();
  }));

  it('documents the three calculator paths', () => {
    expect(Object.values(CalculatorPath)).toEqual([
      CalculatorPath.GUIDED,
      CalculatorPath.INTERMEDIATE,
      CalculatorPath.EXPERT,
    ]);
  });

  it('starts from smart defaults and reaches the Method in seven steps', () => {
    expect(
      fixture.nativeElement.querySelector(
        '[role="radio"][aria-checked="true"]',
      ),
    ).toBeTruthy();
    goToSummary();

    expect(
      fixture.nativeElement.querySelector('[data-testid="open-method"]'),
    ).toBeTruthy();
  });

  it('never asks for the flour strength — W270 is applied for the user', () => {
    const asked: string[] = [];
    for (let step = 0; step < GUIDED_STEP_COUNT; step += 1) {
      asked.push(currentStepId());
      if (step < GUIDED_STEP_COUNT - 1) {
        next();
      }
    }

    expect(asked).toEqual([
      'pizzaType',
      'quantity',
      'doughType',
      'restTime',
      'temperature',
      'yeastType',
      'summary',
    ]);
    expect(fixture.nativeElement.textContent).not.toContain('W2');
    expect(fixture.nativeElement.textContent).not.toContain('flourStrength');
    expect(resolvedInput().flourStrength).toBe(270);
  });

  it('never reads or mutates the Expert Draft', () => {
    const expert = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);
    expert.update({
      pizzaType: PizzaType.NEAPOLITAN,
      flourStrength: 350,
      hydrationRatio: 0.71,
      rtRestTime: 6,
      coldRestTime: 18,
      globalRestTime: null,
    });

    const pizzaChoices = fixture.debugElement.queryAll(By.css('.choice'));
    (pizzaChoices[1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(draft.snapshot().pizzaType).toBe(PizzaType.ROMAN);
    expect(draft.snapshot().globalRestTime).toBe(24);
    expect(expert.snapshot().pizzaType).toBe(PizzaType.NEAPOLITAN);
    expect(expert.snapshot().flourStrength).toBe(350);
  });

  it('places contextual Fiches on the moments of choice', () => {
    next();
    next();
    expect(renderedSheetIds()).toEqual([
      InfoSheetId.DIRECT,
      InfoSheetId.POOLISH,
    ]);

    next();
    expect(renderedSheetIds()).toEqual([InfoSheetId.REST]);

    next();
    expect(renderedSheetIds()).toEqual([InfoSheetId.TEMPERATURE]);

    next();
    expect(renderedSheetIds()).toEqual([InfoSheetId.YEASTS]);
  });

  it('opens the Guided Method from the final summary', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    goToSummary();

    const button = fixture.debugElement.query(
      By.css('[data-testid="open-method"]'),
    );
    (button.nativeElement as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledWith([
      '/tabs/calculator/method/guided',
    ]);
  });

  it('returns to the first question when a new calculation is started', () => {
    goToSummary();
    expect(currentStepId()).withContext('summary reached').toBe('summary');

    // What the header refresh button does once the alert is confirmed.
    draft.newCalculation();
    fixture.detectChanges();

    expect(currentStepId()).toBe('pizzaType');
    expect(prefs.get(GUIDED_STEP_STORAGE_KEY)).toBe(0);
  });

  /**
   * The upper bound of the step index belongs here: only this form knows how
   * many questions it asks, so a step left behind by a release that had more
   * of them lands on the summary rather than on nothing at all.
   */
  it('clamps a stored step beyond its last question', () => {
    draft.setStepIndex(GUIDED_STEP_COUNT + 3);
    fixture.detectChanges();

    expect(currentStepId()).toBe('summary');
  });

  it('offers Dough saving from the summary with the resolved Guided input', () => {
    goToSummary();

    const saver = fixture.debugElement.query(By.directive(DoughSaverComponent));
    expect(saver).toBeTruthy();
    expect((saver.componentInstance as DoughSaverComponent).input()).toEqual(
      resolvedInput(),
    );
  });
});
