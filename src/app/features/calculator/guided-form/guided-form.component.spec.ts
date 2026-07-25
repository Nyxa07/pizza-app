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
import { UNKNOWN_FLOUR_STRENGTH } from '../interfaces/guided-calculator-draft.interface';
import { GUIDED_STEP_STORAGE_KEY } from '../services/calculator-draft-storage.constants';
import { CalculatorInitializerService } from '../services/calculator-initializer.service';
import { ExpertDraftService } from '../services/expert-draft.service';
import { GuidedDraftService } from '../services/guided-draft.service';
import { GuidedInputAdapter } from '../services/guided-input.adapter';
import { GuidedFormComponent } from './guided-form.component';

describe('GuidedFormComponent', () => {
  let fixture: ComponentFixture<GuidedFormComponent>;
  let draft: GuidedDraftService;
  let prefs: FakePrefsStorage;

  const next = (): void => {
    const button = fixture.debugElement.query(
      By.css('[data-testid="next-step"]'),
    );
    (button.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  const currentStepId = (): string | null =>
    fixture.nativeElement
      .querySelector('.question')
      ?.getAttribute('aria-labelledby')
      ?.replace('guided-question-', '') ?? null;

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

    TestBed.inject(CalculatorInitializerService).initGuided();
    draft = TestBed.inject(GuidedDraftService);
    fixture = TestBed.createComponent(GuidedFormComponent);
    fixture.detectChanges();
  }));

  it('defines exactly the Guided and Expert paths', () => {
    expect(Object.values(CalculatorPath)).toEqual([
      CalculatorPath.GUIDED,
      CalculatorPath.EXPERT,
    ]);
  });

  it('starts from smart defaults and reaches the Method in eight steps', () => {
    expect(
      fixture.nativeElement.querySelector(
        '[role="radio"][aria-checked="true"]',
      ),
    ).toBeTruthy();

    for (let step = 0; step < 7; step += 1) {
      next();
    }

    expect(
      fixture.nativeElement.querySelector('[data-testid="open-method"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'calculator.guided.summary.unknownFlourStrength',
    );
  });

  it('offers the sampled flour strengths and defaults unknown to W270', () => {
    next();

    const choices = fixture.debugElement.queryAll(By.css('.pill'));
    expect(choices.map(({ nativeElement }) => nativeElement.textContent.trim()))
      .withContext('flour choices')
      .toEqual([
        'W270',
        'W300',
        'W320',
        'W350',
        'calculator.guided.options.unknownFlourStrength',
      ]);
    expect(draft.getDraft().flourStrengthChoice).toBe(UNKNOWN_FLOUR_STRENGTH);

    (choices[3].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(draft.getDraft().flourStrengthChoice).toBe(350);
  });

  it('never reads or mutates the Expert Draft', () => {
    const expert = TestBed.inject(ExpertDraftService);
    expert.init();
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

    expect(draft.getDraft().pizzaType).toBe(PizzaType.ROMAN);
    expect(draft.getDraft().flourStrengthChoice).toBe(UNKNOWN_FLOUR_STRENGTH);
    expect(draft.getDraft().globalRestTime).toBe(24);
    expect(expert.getInput().pizzaType).toBe(PizzaType.NEAPOLITAN);
    expect(expert.getInput().flourStrength).toBe(350);
  });

  it('places contextual Fiches on the moments of choice', () => {
    next();
    next();
    next();
    expect(renderedSheetIds()).toEqual([
      InfoSheetId.DIRECT,
      InfoSheetId.POOLISH,
    ]);

    next();
    expect(renderedSheetIds()).toEqual([
      InfoSheetId.WARM_REST,
      InfoSheetId.COLD_REST,
    ]);

    next();
    expect(renderedSheetIds()).toEqual([InfoSheetId.TEMPERATURE]);

    next();
    expect(renderedSheetIds()).toEqual([InfoSheetId.YEASTS]);
  });

  it('opens the Guided Method from the final summary', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    for (let step = 0; step < 7; step += 1) {
      next();
    }

    const button = fixture.debugElement.query(
      By.css('[data-testid="open-method"]'),
    );
    (button.nativeElement as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledWith([
      '/tabs/calculator/method/guided',
    ]);
  });

  it('returns to the first question when a new calculation is started', () => {
    for (let step = 0; step < 7; step += 1) {
      next();
    }
    expect(currentStepId()).withContext('summary reached').toBe('summary');

    // What the header refresh button does once the alert is confirmed.
    draft.newCalculation();
    fixture.detectChanges();

    expect(currentStepId()).toBe('pizzaType');
    expect(prefs.get(GUIDED_STEP_STORAGE_KEY)).toBe(0);
  });

  it('restores the persisted step when the Guided page is entered again', () => {
    prefs.set(GUIDED_STEP_STORAGE_KEY, 2);
    TestBed.inject(CalculatorInitializerService).initGuided();
    fixture.detectChanges();

    expect(currentStepId()).toBe('quantity');
  });

  it('offers Dough saving from the summary with the resolved Guided input', () => {
    for (let step = 0; step < 7; step += 1) {
      next();
    }

    const saver = fixture.debugElement.query(
      By.directive(DoughSaverComponent),
    );
    expect(saver).toBeTruthy();
    const expected = TestBed.inject(GuidedInputAdapter).resolve(
      draft.getDraft(),
    );
    expect(
      (saver.componentInstance as DoughSaverComponent).input(),
    ).toEqual(expected);
  });
});
