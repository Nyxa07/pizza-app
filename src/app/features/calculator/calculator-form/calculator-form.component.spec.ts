import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { InfoSheetId } from 'src/app/features/sheets/enums/info-sheet-id.enum';
import { InfoSheetButtonComponent } from 'src/app/features/sheets/info-sheet-button/info-sheet-button.component';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughType } from '../enums/dough-type.enum';
import { CalculatorFormComponent } from './calculator-form.component';

/**
 * The Fiches open from the calculation screen (issue #70): every visible
 * concept field carries its ⓘ affordance, following the selected method.
 */
describe('CalculatorFormComponent', () => {
  let fixture: ComponentFixture<CalculatorFormComponent>;

  const renderedSheetIds = (): InfoSheetId[] =>
    fixture.debugElement
      .queryAll(By.directive(InfoSheetButtonComponent))
      .map((button) =>
        (button.componentInstance as InfoSheetButtonComponent).sheetId(),
      );

  const userPicksMethod = (doughType: DoughType): void => {
    fixture.componentInstance['form'].patchValue({ doughType });
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalculatorFormComponent],
      providers: [
        provideIonicAngular(),
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorFormComponent);
    fixture.detectChanges();
  }));

  it('carries an ⓘ affordance on every visible concept field', () => {
    userPicksMethod(DoughType.DIRECT);

    expect(renderedSheetIds()).toEqual(
      jasmine.arrayContaining([
        InfoSheetId.DIRECT,
        InfoSheetId.YEASTS,
        InfoSheetId.TEMPERATURE,
        InfoSheetId.WARM_REST,
        InfoSheetId.COLD_REST,
      ]),
    );
  });

  it('follows the selected method: poolish surfaces the poolish Fiches', () => {
    userPicksMethod(DoughType.POOLISH);

    const ids = renderedSheetIds();
    expect(ids).toContain(InfoSheetId.POOLISH);
    expect(ids).toContain(InfoSheetId.POOLISH_RATIO);
    expect(ids).not.toContain(InfoSheetId.DIRECT);
  });
});
