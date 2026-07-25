import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
import { ExpertDraftService } from 'src/app/features/calculator/services/expert-draft.service';
import { GuidedDraftService } from 'src/app/features/calculator/services/guided-draft.service';
import { GuidedInputAdapter } from 'src/app/features/calculator/services/guided-input.adapter';
import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { CalculatorMethodPage } from './method.page';

describe('CalculatorMethodPage (Dough saving)', () => {
  const configure = (path: CalculatorPath): void => {
    TestBed.configureTestingModule({
      imports: [CalculatorMethodPage],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { calculatorPath: path } } },
        },
      ],
    });
  };

  const boundSaverInput = (
    fixture: ComponentFixture<CalculatorMethodPage>,
  ): unknown => {
    fixture.detectChanges();
    const saver = fixture.debugElement.query(
      By.directive(DoughSaverComponent),
    );
    expect(saver).withContext('dough saver in the header').toBeTruthy();
    return (saver.componentInstance as DoughSaverComponent).input();
  };

  it('binds the resolved Guided input to the Dough saver', () => {
    configure(CalculatorPath.GUIDED);
    TestBed.inject(CalculatorInitializerService).initGuided();

    const input = boundSaverInput(TestBed.createComponent(CalculatorMethodPage));

    const expected = TestBed.inject(GuidedInputAdapter).resolve(
      TestBed.inject(GuidedDraftService).getDraft(),
    );
    expect(input).toEqual(expected);
  });

  it('binds the Expert Draft input to the Dough saver', () => {
    configure(CalculatorPath.EXPERT);
    TestBed.inject(CalculatorInitializerService).initExpert();

    const input = boundSaverInput(TestBed.createComponent(CalculatorMethodPage));

    expect(input).toEqual(TestBed.inject(ExpertDraftService).getInput());
  });
});
