import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AlertController } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { CalculatorPath } from '../enums/calculator-path.enum';
import { ExpertDraftService } from '../services/expert-draft.service';
import { GuidedDraftService } from '../services/guided-draft.service';
import { CalculatorRefreshButtonComponent } from './calculator-refresh-button.component';

describe('CalculatorRefreshButtonComponent', () => {
  let fixture: ComponentFixture<CalculatorRefreshButtonComponent>;
  let guided: GuidedDraftService;
  let expert: ExpertDraftService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalculatorRefreshButtonComponent],
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    guided = TestBed.inject(GuidedDraftService);
    expert = TestBed.inject(ExpertDraftService);
    guided.init();
    expert.init();

    fixture = TestBed.createComponent(CalculatorRefreshButtonComponent);
    fixture.componentRef.setInput('path', CalculatorPath.GUIDED);
    fixture.detectChanges();
  }));

  it('clicking asks for confirmation before touching either Draft', async () => {
    guided.update({ nbPizzas: 9 });
    expert.update({ nbPizzas: 12 });
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
    expect(guided.getDraft().nbPizzas).toBe(9);
    expect(expert.getInput().nbPizzas).toBe(12);
  });

  it('confirming resets only the requested path', async () => {
    guided.update({ nbPizzas: 9 });
    expert.update({ nbPizzas: 12 });
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

    expect(guided.getDraft().nbPizzas).toBe(5);
    expect(expert.getInput().nbPizzas).toBe(12);
  });
});
