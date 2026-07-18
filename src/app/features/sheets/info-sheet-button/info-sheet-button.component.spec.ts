import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ModalController } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { InfoSheetId } from '../enums/info-sheet-id.enum';
import { InfoSheetComponent } from '../info-sheet/info-sheet.component';
import { InfoSheetButtonComponent } from './info-sheet-button.component';

describe('InfoSheetButtonComponent', () => {
  it('opens the requested Fiche as a sheet modal', async () => {
    const modal = jasmine.createSpyObj<HTMLIonModalElement>('modal', [
      'present',
    ]);
    const modalController = jasmine.createSpyObj<ModalController>(
      'ModalController',
      ['create'],
    );
    modalController.create.and.resolveTo(modal);

    TestBed.configureTestingModule({
      imports: [InfoSheetButtonComponent],
      providers: [
        provideTranslateService(),
        { provide: ModalController, useValue: modalController },
      ],
    });
    const fixture = TestBed.createComponent(InfoSheetButtonComponent);
    fixture.componentRef.setInput('sheetId', InfoSheetId.TEMPERATURE);
    fixture.detectChanges();

    fixture.debugElement
      .query(By.css('ion-button'))
      .triggerEventHandler('click', new Event('click'));
    await fixture.whenStable();

    expect(modalController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        component: InfoSheetComponent,
        componentProps: { sheetId: InfoSheetId.TEMPERATURE },
      }),
    );
    expect(modal.present).toHaveBeenCalled();
  });
});
