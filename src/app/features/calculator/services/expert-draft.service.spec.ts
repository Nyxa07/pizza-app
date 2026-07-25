import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { EXPERT_DRAFT_STORAGE_KEY } from './calculator-draft-storage.constants';
import { DoughDefaultsService } from './dough-defaults.service';
import { ExpertDraftService } from './expert-draft.service';

describe('ExpertDraftService', () => {
  let prefs: FakePrefsStorage;
  let defaults: DoughDefaultsService;
  let service: ExpertDraftService;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    defaults = TestBed.inject(DoughDefaultsService);
    service = TestBed.inject(ExpertDraftService);
    service.init();
  });

  it('persists and resumes the Expert Draft', () => {
    service.update({ nbPizzas: 8, hydrationRatio: 0.68 });

    expect(prefs.get(EXPERT_DRAFT_STORAGE_KEY)).toEqual(service.getInput());

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    const resumed = TestBed.inject(ExpertDraftService);
    resumed.init();

    expect(resumed.getInput().nbPizzas).toBe(8);
    expect(resumed.getInput().hydrationRatio).toBe(0.68);
  });

  it('starts a new Expert calculation from current Defaults', () => {
    service.update({ nbPizzas: 8, hydrationRatio: 0.65 });
    defaults.update({ hydrationRatio: 0.8 });

    service.newCalculation();

    expect(service.getInput().nbPizzas).toBe(5);
    expect(service.getInput().hydrationRatio).toBe(0.8);
  });

  it('replaces the Expert Draft with a detached copy', () => {
    const snapshot = { ...service.getInput(), nbPizzas: 9 };

    service.replaceWithCopy(snapshot);
    snapshot.nbPizzas = 2;

    expect(service.getInput().nbPizzas).toBe(9);
  });
});
