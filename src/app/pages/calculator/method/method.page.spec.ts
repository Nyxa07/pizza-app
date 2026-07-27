import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';
import { CalculatorMethods } from 'src/app/features/calculator/method/calculator-methods.service';
import { MethodClock } from 'src/app/features/calculator/method/method-clock';
import { CalculatorPaths } from 'src/app/features/calculator/paths/calculator-paths.service';
import { GUIDED_PATH } from 'src/app/features/calculator/paths/guided.path';
import { INTERMEDIATE_PATH } from 'src/app/features/calculator/paths/intermediate.path';
import { DoughDefaultsService } from 'src/app/features/calculator/services/dough-defaults.service';
import { FixedMethodClock } from 'src/app/features/calculator/testing/fixed-method-clock';
import { DoughSaverComponent } from 'src/app/features/doughs/dough-saver/dough-saver.component';
import { MethodComponent } from 'src/app/features/method/method.component';
import { PizzaType } from 'src/app/features/settings/enums/pizza-type.enum';
import { idleCallback } from 'src/app/shared/helpers/request-idle-cb';
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
          provide: MethodClock,
          useValue: new FixedMethodClock(new Date(2026, 6, 14, 20, 53)),
        },
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

  describe('what it renders', () => {
    /** The screen only draws past its idle callback; this waits for it. */
    const settled = async (
      fixture: ComponentFixture<CalculatorMethodPage>,
    ): Promise<void> => {
      fixture.detectChanges();
      await new Promise<void>((resolve) => idleCallback(() => resolve()));
      fixture.detectChanges();
    };

    it('renders the method of its own path, on the module clock', async () => {
      configure(CalculatorPath.EXPERT);
      const draft = TestBed.inject(CalculatorPaths).for(CalculatorPath.EXPERT);
      const fixture = TestBed.createComponent(CalculatorMethodPage);

      await settled(fixture);
      const rendered = fixture.debugElement.query(
        By.directive(MethodComponent),
      );

      // The very method the module builds for that Draft — the screen adds
      // nothing of its own, not even the hour it starts counting from.
      expect(rendered).withContext('the rendered method').toBeTruthy();
      expect((rendered.componentInstance as MethodComponent).method()).toEqual(
        TestBed.inject(CalculatorMethods).methodFor(draft.snapshot())!,
      );
    });

    it('offers a way out rather than an empty run when there is nothing to narrate', async () => {
      configure(CalculatorPath.EXPERT);
      TestBed.inject(CalculatorPaths)
        .for(CalculatorPath.EXPERT)
        .update({ nbPizzas: 0 });
      const fixture = TestBed.createComponent(CalculatorMethodPage);

      await settled(fixture);

      expect(
        fixture.debugElement.query(By.directive(MethodComponent)),
      ).toBeNull();
      expect(
        fixture.debugElement.query(By.css('.app-empty-state')),
      ).toBeTruthy();
    });
  });
});
