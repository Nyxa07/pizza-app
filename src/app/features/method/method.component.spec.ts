import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  TranslateCompiler,
  TranslateService,
  provideTranslateService,
} from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { firstValueFrom } from 'rxjs';

import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import { CalculatorMethods } from 'src/app/features/calculator/method/calculator-methods.service';
import { MethodClock } from 'src/app/features/calculator/method/method-clock';
import {
  DIRECT_INPUT,
  POOLISH_INPUT,
} from 'src/app/features/calculator/testing/calculator-input.fixture';
import { FixedMethodClock } from 'src/app/features/calculator/testing/fixed-method-clock';
import { Locales } from 'src/app/features/settings/enums/locales.enum';
import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';
import frCalculator from 'src/assets/i18n/fr/calculator.json';
import frCommon from 'src/assets/i18n/fr/common.json';

import { MethodComponent } from './method.component';

/**
 * The Method as the user reads it, rendered from a real run of the module —
 * no hand-written `IMethod`, so a step the engine stops producing stops being
 * rendered here too.
 */
describe('MethodComponent', () => {
  let fixture: ComponentFixture<MethodComponent>;
  let methods: CalculatorMethods;

  beforeEach(async () => {
    registerLocaleData(localeFr);

    await TestBed.configureTestingModule({
      imports: [MethodComponent],
      providers: [
        provideTranslateService({
          compiler: {
            provide: TranslateCompiler,
            useClass: TranslateMessageFormatCompiler,
          },
        }),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
        {
          provide: LocaleManagerService,
          useValue: {
            getLocale: () => Locales.FR,
            getCurrentAngularLocale: () => 'fr-FR',
          },
        },
        {
          // A Tuesday evening off the grid: the method starts at 21:00.
          provide: MethodClock,
          useValue: new FixedMethodClock(new Date(2026, 6, 14, 20, 53)),
        },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(Locales.FR, {
      calculator: frCalculator,
      common: frCommon,
    });
    await firstValueFrom(translate.use(Locales.FR));

    methods = TestBed.inject(CalculatorMethods);
    fixture = TestBed.createComponent(MethodComponent);
  });

  const render = (input: ICalculatorInput): HTMLElement => {
    fixture.componentRef.setInput('method', methods.methodFor(input));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  const steps = () => fixture.debugElement.queryAll(By.css('li.step'));

  const stepTitled = (title: string) =>
    steps().find((step) =>
      step.query(By.css('.title')).nativeElement.textContent.includes(title),
    );

  it('announces when the dough will be ready', () => {
    const text = render(POOLISH_INPUT).textContent ?? '';

    // 30 h 12 of prep from 21:00, on the quarter-hour grid.
    expect(text).toContain('Prête à enfourner');
    expect(text).toContain('03:15');
  });

  it('weighs in each part of a poolish dough under its own title', () => {
    const parts = render(POOLISH_INPUT).querySelectorAll('.part');

    expect(parts.length).toBe(2);
    expect(parts[0].textContent).toContain('Poolish');
    expect(parts[0].textContent).toContain('250');
    // The pinch of yeast is read to the centigram, in the French notation,
    // while everything around it stays on the kitchen scale.
    expect(parts[0].textContent).toContain('0,10');
    expect(parts[1].textContent).toContain('Pâte avec poolish');
    expect(parts[1].textContent).toContain('522');
  });

  it('leaves a single-part dough without a part title', () => {
    const parts = render(DIRECT_INPUT).querySelectorAll('.part');

    expect(parts.length).toBe(1);
    expect(parts[0].querySelector('h4')).toBeNull();
    expect(parts[0].textContent).toContain('772');
  });

  it('renders the whole run, the bake last and marked as such', () => {
    render(POOLISH_INPUT);
    const rendered = steps();

    expect(rendered.length).toBe(16);
    const last = rendered[rendered.length - 1];
    expect(last.nativeElement.textContent).toContain('enfourner');
    expect(last.nativeElement.classList).toContain('bake');
  });

  it('puts a clock on the milestones and nothing on the steps that follow', () => {
    render(POOLISH_INPUT);

    expect(stepTitled('Mélanger')?.query(By.css('.when'))).toBeTruthy();
    expect(
      stepTitled('Mélanger')?.query(By.css('.when')).nativeElement.textContent,
    ).toContain('21:00');
    expect(stepTitled('Repos 1H')?.query(By.css('.when'))).toBeNull();
  });

  it('narrates the quantities a step engages, and none where there are none', () => {
    render(POOLISH_INPUT);

    // Non-breaking spaces before the unit, as the French typography asks.
    expect(
      stepTitled('Mélanger')?.query(By.css('.quantities')).nativeElement
        .textContent,
    ).toContain("250\u00a0g d'eau · 0,10\u00a0g de levure · 3\u00a0g de miel");
    expect(stepTitled('Repos 1H')?.query(By.css('.quantities'))).toBeNull();
  });

  it('folds a helper inline where the step has one, and only there', () => {
    render(POOLISH_INPUT);
    const knead = stepTitled('Pétrir la pâte');

    expect(knead?.query(By.css('details'))).toBeTruthy();
    expect(knead?.queryAll(By.css('details p')).length).toBe(3);
    expect(stepTitled('Repos 1H')?.query(By.css('details'))).toBeNull();
  });

  it('never leaks a translation key to the reader', () => {
    const text = render(POOLISH_INPUT).textContent ?? '';

    expect(text).not.toContain('calculator.');
    expect(text).not.toContain('common.');
  });
});
