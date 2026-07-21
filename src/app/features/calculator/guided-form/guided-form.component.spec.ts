import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { InfoSheetId } from '../../sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from '../../sheets/info-sheet-button/info-sheet-button.component';
import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { CalculatorPath } from '../enums/calculator-path.enum';
import { CalculatorInitializerService } from '../services/calculator-initializer.service';
import { CalculatorStateService } from '../services/calculator-state.service';
import { GuidedFormComponent } from './guided-form.component';

describe('GuidedFormComponent', () => {
  let fixture: ComponentFixture<GuidedFormComponent>;
  let state: CalculatorStateService;
  let initializer: CalculatorInitializerService;

  const next = (): void => {
    const button = fixture.debugElement.query(
      By.css('[data-testid="next-step"]'),
    );
    (button.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  const renderedSheetIds = (): InfoSheetId[] =>
    fixture.debugElement
      .queryAll(By.directive(InfoSheetButtonComponent))
      .map((button) =>
        (button.componentInstance as InfoSheetButtonComponent).sheetId(),
      );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GuidedFormComponent],
      providers: [
        provideIonicAngular(),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    initializer = TestBed.inject(CalculatorInitializerService);
    initializer.initGuided();
    state = TestBed.inject(CalculatorStateService);
    fixture = TestBed.createComponent(GuidedFormComponent);
    fixture.detectChanges();
  }));

  it('defines exactly the Guided and Expert paths', () => {
    expect(Object.values(CalculatorPath)).toEqual([
      CalculatorPath.GUIDED,
      CalculatorPath.EXPERT,
    ]);
  });

  it('starts from smart defaults and can reach the Method without technical input', () => {
    expect(
      fixture.nativeElement.querySelector(
        '[role="radio"][aria-checked="true"]',
      ),
    ).toBeTruthy();

    for (let step = 0; step < 6; step += 1) {
      next();
    }

    expect(
      fixture.nativeElement.querySelector('[data-testid="open-method"]'),
    ).toBeTruthy();
  });

  it('edits the shared Draft without dropping Expert-only values', () => {
    state.update({ hydrationRatio: 0.71, saltRatio: 0.031 });

    const pizzaChoices = fixture.debugElement.queryAll(By.css('.choice'));
    (pizzaChoices[1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(state.getInput().pizzaType).toBe(PizzaType.ROMAN);
    expect(state.getInput().hydrationRatio).toBe(0.71);
    expect(state.getInput().saltRatio).toBe(0.031);

    initializer.initExpert();
    expect(state.getInput().pizzaType).toBe(PizzaType.ROMAN);
    expect(state.getInput().hydrationRatio).toBe(0.71);

    initializer.initGuided();
    expect(state.getInput().saltRatio).toBe(0.031);
  });

  it('places contextual Fiches on the moments of choice', () => {
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

  it('shows an Expert ambient/cold split as one approachable rest duration', () => {
    state.update({
      globalRestTime: null,
      rtRestTime: 6,
      coldRestTime: 18,
    });
    next();
    next();
    next();

    const selected = fixture.debugElement.query(
      By.css('.pill[aria-checked="true"]'),
    );
    expect(selected.nativeElement.textContent).toContain('24 h');
    expect(state.getInput().rtRestTime).toBe(6);
    expect(state.getInput().coldRestTime).toBe(18);
  });

  it('opens the full Method from the final summary', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    for (let step = 0; step < 6; step += 1) {
      next();
    }

    const button = fixture.debugElement.query(
      By.css('[data-testid="open-method"]'),
    );
    (button.nativeElement as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledWith(['/tabs/calculator/method']);
  });
});
