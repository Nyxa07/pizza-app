import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { CalculatorInitializerService } from 'src/app/features/calculator/services/calculator-initializer.service';
import { ExpertDraftService } from 'src/app/features/calculator/services/expert-draft.service';
import { GuidedDraftService } from 'src/app/features/calculator/services/guided-draft.service';
import { GuidedInputAdapter } from 'src/app/features/calculator/services/guided-input.adapter';
import { IntermediateDraftService } from 'src/app/features/calculator/services/intermediate-draft.service';
import { IntermediateInputAdapter } from 'src/app/features/calculator/services/intermediate-input.adapter';
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
    const saver = fixture.debugElement.query(By.directive(DoughSaverComponent));
    expect(saver).withContext('dough saver in the header').toBeTruthy();
    return (saver.componentInstance as DoughSaverComponent).input();
  };

  it('binds the resolved Guided input to the Dough saver', () => {
    configure(CalculatorPath.GUIDED);
    TestBed.inject(CalculatorInitializerService).init(CalculatorPath.GUIDED);

    const input = boundSaverInput(
      TestBed.createComponent(CalculatorMethodPage),
    );

    const expected = TestBed.inject(GuidedInputAdapter).resolve(
      TestBed.inject(GuidedDraftService).getDraft(),
    );
    expect(input).toEqual(expected);
  });

  it('reads the Intermediate Draft and binds its resolved input', () => {
    configure(CalculatorPath.INTERMEDIATE);
    const initializer = TestBed.inject(CalculatorInitializerService);
    initializer.init(CalculatorPath.INTERMEDIATE);
    // A 33 cm Roman: the grammes must follow the Intermediate answers, not
    // the Expert Draft.
    TestBed.inject(IntermediateDraftService).update({
      pizzaType: PizzaType.ROMAN,
      sizeCm: 33,
      nbPizzas: 4,
    });

    const input = boundSaverInput(
      TestBed.createComponent(CalculatorMethodPage),
    );

    expect(input).toEqual(
      TestBed.inject(IntermediateInputAdapter).resolve(
        TestBed.inject(IntermediateDraftService).getDraft(),
      ),
    );
    expect((input as { pizzaWeight: number }).pizzaWeight).toBe(210);
  });

  it('binds the Expert Draft input to the Dough saver', () => {
    configure(CalculatorPath.EXPERT);
    TestBed.inject(CalculatorInitializerService).init(CalculatorPath.EXPERT);

    const input = boundSaverInput(
      TestBed.createComponent(CalculatorMethodPage),
    );

    expect(input).toEqual(TestBed.inject(ExpertDraftService).getInput());
  });
});
