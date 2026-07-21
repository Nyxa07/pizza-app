import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular/standalone';
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

  it('clicking asks for confirmation before touching the Draft', async () => {
    const state = TestBed.inject(CalculatorStateService);
    state.update({ nbPizzas: 9 });
    const alertController = TestBed.inject(AlertController);
    const present = jasmine.createSpy('present');
    const create = spyOn(alertController, 'create').and.resolveTo({
      present,
    } as unknown as HTMLIonAlertElement);

    fixture.debugElement
      .query(By.css('ion-button'))
      .triggerEventHandler('click');
    await fixture.whenStable();

    expect(create).toHaveBeenCalled();
    expect(present).toHaveBeenCalled();
    expect(state.getInput().nbPizzas).toBe(9);
  });

  it('confirming restarts the Draft from the user Defaults', async () => {
    const state = TestBed.inject(CalculatorStateService);
    state.update({ nbPizzas: 9 });
    const alertController = TestBed.inject(AlertController);
    let confirmHandler: (() => void) | undefined;
    spyOn(alertController, 'create').and.callFake(async (config) => {
      const destructive = config?.buttons?.find(
        (button) => typeof button !== 'string' && button.role === 'destructive',
      );
      confirmHandler =
        destructive && typeof destructive !== 'string'
          ? (destructive.handler as () => void)
          : undefined;
      return {
        present: jasmine.createSpy('present'),
      } as unknown as HTMLIonAlertElement;
    });

    fixture.debugElement
      .query(By.css('ion-button'))
      .triggerEventHandler('click');
    await fixture.whenStable();
    confirmHandler?.();

    expect(state.getInput().nbPizzas).toBe(5);
  });
});
