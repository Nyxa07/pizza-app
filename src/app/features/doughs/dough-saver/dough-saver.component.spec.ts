import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import { ExpertDraftService } from 'src/app/features/calculator/services/expert-draft.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughsService } from '../services/doughs.service';

import { DoughSaverComponent } from './dough-saver.component';

describe('DoughSaverComponent', () => {
  let fixture: ComponentFixture<DoughSaverComponent>;
  let doughs: DoughsService;
  let expertDraft: ExpertDraftService;

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

    expertDraft = TestBed.inject(ExpertDraftService);
    expertDraft.init();
    doughs = TestBed.inject(DoughsService);
    fixture = TestBed.createComponent(DoughSaverComponent);
    fixture.detectChanges();
  });

  it('creates the save control', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('saves the bound input instead of the Expert Draft', () => {
    spyOn(doughs, 'save').and.callThrough();
    spyOn(doughs, 'saveDraft');
    const input: ICalculatorInput = {
      ...expertDraft.getInput(),
      nbPizzas: 7,
    };
    fixture.componentRef.setInput('input', input);

    saveWithName('From the Method');

    expect(doughs.save).toHaveBeenCalledWith('From the Method', input);
    expect(doughs.saveDraft).not.toHaveBeenCalled();
    expect(doughs.list()[0]?.input.nbPizzas).toBe(7);
  });

  it('falls back to the Expert Draft when no input is bound', () => {
    spyOn(doughs, 'saveDraft').and.callThrough();
    expertDraft.update({ nbPizzas: 5 });

    saveWithName('From Expert');

    expect(doughs.saveDraft).toHaveBeenCalledWith('From Expert');
    expect(doughs.list()[0]?.input.nbPizzas).toBe(5);
  });

  it('rejects a name that an existing Dough already has', () => {
    doughs.saveDraft('Taken');

    const name = fixture.componentInstance['form'].controls.name;
    name.setValue('taken');

    expect(name.errors?.['doughNameExists']).toBeTrue();
    expect(fixture.componentInstance['form'].invalid).toBeTrue();
  });
});
