import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { CalculatorPaths } from 'src/app/features/calculator/paths/calculator-paths.service';
import { GUIDED_PATH } from 'src/app/features/calculator/paths/guided.path';
import { INTERMEDIATE_PATH } from 'src/app/features/calculator/paths/intermediate.path';
import { DoughDefaultsService } from 'src/app/features/calculator/services/dough-defaults.service';
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

  /** « Mes pâtes par défaut », as the path definitions read them. */
  const defaults = () => TestBed.inject(DoughDefaultsService).getDefaults();

  it('binds the resolved Guided input to the Dough saver', () => {
    configure(CalculatorPath.GUIDED);
    const draft = TestBed.inject(CalculatorPaths).for(CalculatorPath.GUIDED);

    const input = boundSaverInput(
      TestBed.createComponent(CalculatorMethodPage),
    );

    expect(input).toEqual(GUIDED_PATH.toInput(draft.snapshot(), defaults()));
  });

  it('reads the Intermediate Draft and binds its resolved input', () => {
    configure(CalculatorPath.INTERMEDIATE);
    const draft = TestBed.inject(CalculatorPaths).for(
      CalculatorPath.INTERMEDIATE,
    );
    // A 33 cm Roman: the grammes must follow the Intermediate answers, not
    // the Expert Draft.
    draft.update({
      pizzaType: PizzaType.ROMAN,
      sizeCm: 33,
      nbPizzas: 4,
    });

    const input = boundSaverInput(
      TestBed.createComponent(CalculatorMethodPage),
    );

    expect(input).toEqual(
      INTERMEDIATE_PATH.toInput(draft.snapshot(), defaults()),
    );
    expect((input as { pizzaWeight: number }).pizzaWeight).toBe(210);
  });

  it('binds the Expert Draft input to the Dough saver', () => {
    configure(CalculatorPath.EXPERT);
    const draft = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);

    const input = boundSaverInput(
      TestBed.createComponent(CalculatorMethodPage),
    );

    expect(input).toEqual(draft.snapshot());
  });
});
