import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { CalculatorPaths } from 'src/app/features/calculator/paths/calculator-paths.service';
import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { CalculatorExpertPage } from './expert.page';

/**
 * The Expert screen names no Draft: it hands the Dough saver the input its
 * own path resolved, exactly like the three other calculator screens.
 */
describe('CalculatorExpertPage (Dough saving)', () => {
  let fixture: ComponentFixture<CalculatorExpertPage>;
  let originalRequestIdleCallback: typeof window.requestIdleCallback;

  beforeEach(() => {
    // The header defers past the first idle frame — run it synchronously so
    // the assertions do not hinge on idle scheduling.
    originalRequestIdleCallback = window.requestIdleCallback;
    window.requestIdleCallback = ((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline);
      return 0;
    }) as typeof window.requestIdleCallback;

    TestBed.configureTestingModule({
      imports: [CalculatorExpertPage],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    });
    fixture = TestBed.createComponent(CalculatorExpertPage);
    fixture.componentInstance.ionViewWillEnter();
  });

  afterEach(() => {
    window.requestIdleCallback = originalRequestIdleCallback;
  });

  const boundSaverInput = (): unknown => {
    fixture.detectChanges();
    const saver = fixture.debugElement.query(By.directive(DoughSaverComponent));
    expect(saver).withContext('dough saver in the header').toBeTruthy();
    return (saver.componentInstance as DoughSaverComponent).input();
  };

  it('binds the resolved Expert input to the Dough saver', () => {
    const draft = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);
    draft.update({ nbPizzas: 9, hydrationRatio: 0.71 });

    expect(boundSaverInput()).toEqual(draft.snapshot());
  });

  it('follows the Draft, so a saved Dough carries the last edit', () => {
    const draft = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);
    boundSaverInput();

    draft.update({ nbPizzas: 12 });
    fixture.detectChanges();

    expect((boundSaverInput() as { nbPizzas: number }).nbPizzas).toBe(12);
  });
});
