import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';

import { CalculatorStateService } from 'src/app/features/calculator/services/calculator-state.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { CalculatorRefreshButtonComponent } from './calculator-refresh-button.component';

describe('CalculatorRefreshButtonComponent', () => {
  let component: CalculatorRefreshButtonComponent;
  let fixture: ComponentFixture<CalculatorRefreshButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalculatorRefreshButtonComponent],
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorRefreshButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clicking explicitly restarts the Draft from the user Defaults', () => {
    const state = TestBed.inject(CalculatorStateService);
    state.update({ nbPizzas: 9 });

    fixture.debugElement
      .query(By.css('ion-button'))
      .triggerEventHandler('click');

    expect(state.getInput().nbPizzas).toBe(5);
  });
});
