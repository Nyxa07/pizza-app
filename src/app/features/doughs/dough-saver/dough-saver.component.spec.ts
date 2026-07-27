import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import { DoughDefaultsService } from 'src/app/features/calculator/services/dough-defaults.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughsService } from '../services/doughs.service';

import { DoughSaverComponent } from './dough-saver.component';

describe('DoughSaverComponent', () => {
  let fixture: ComponentFixture<DoughSaverComponent>;
  let doughs: DoughsService;
  let input: ICalculatorInput;

  const saveWithName = (name: string): void => {
    fixture.componentInstance['form'].controls.name.setValue(name);
    fixture.componentInstance['save']();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoughSaverComponent],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    doughs = TestBed.inject(DoughsService);
    input = {
      ...TestBed.inject(DoughDefaultsService).getDefaults(),
      nbPizzas: 7,
    };
    fixture = TestBed.createComponent(DoughSaverComponent);
    fixture.componentRef.setInput('input', input);
    fixture.detectChanges();
  });

  it('creates the save control', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  /** It names no Draft: every screen hands it the input its own path resolved. */
  it('saves the bound input, whichever path resolved it', () => {
    spyOn(doughs, 'save').and.callThrough();

    saveWithName('From the Method');

    expect(doughs.save).toHaveBeenCalledWith('From the Method', input);
    expect(doughs.list()[0]?.input.nbPizzas).toBe(7);
  });

  it('rejects a name that an existing Dough already has', () => {
    doughs.save('Taken', input);

    const name = fixture.componentInstance['form'].controls.name;
    name.setValue('taken');

    expect(name.errors?.['doughNameExists']).toBeTrue();
    expect(fixture.componentInstance['form'].invalid).toBeTrue();
  });
});
