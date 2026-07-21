import { TestBed } from '@angular/core/testing';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughSaverComponent } from './dough-saver.component';

describe('DoughSaverComponent', () => {
  it('creates the Expert save control', async () => {
    await TestBed.configureTestingModule({
      imports: [DoughSaverComponent],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DoughSaverComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
