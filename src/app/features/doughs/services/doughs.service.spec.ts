import { TestBed } from '@angular/core/testing';

import { GUIDED_DRAFT_STORAGE_KEY } from 'src/app/features/calculator/services/calculator-draft-storage.constants';
import { ExpertDraftService } from 'src/app/features/calculator/services/expert-draft.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DOUGHS_STORAGE_KEY, DoughsService } from './doughs.service';

describe('DoughsService (Doughs are documents)', () => {
  let prefs: FakePrefsStorage;
  let state: ExpertDraftService;
  let service: DoughsService;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    state = TestBed.inject(ExpertDraftService);
    state.init();
    service = TestBed.inject(DoughsService);
  });

  it('saves the Draft as an independent named Dough snapshot', () => {
    state.update({ nbPizzas: 8, hydrationRatio: 0.68 });

    const dough = service.saveDraft('Saturday dough');
    state.update({ nbPizzas: 2, hydrationRatio: 0.55 });

    expect(service.get(dough.id)?.input.nbPizzas).toBe(8);
    expect(service.get(dough.id)?.input.hydrationRatio).toBe(0.68);
    expect(prefs.get<unknown[]>(DOUGHS_STORAGE_KEY)?.length).toBe(1);
  });

  it('opening a Dough never touches the current Draft', () => {
    state.update({ nbPizzas: 8 });
    const dough = service.saveDraft('Document');
    state.update({ nbPizzas: 3 });

    const opened = service.get(dough.id);

    expect(opened?.input.nbPizzas).toBe(8);
    expect(state.getInput().nbPizzas).toBe(3);
  });

  it('Adjust loads a copy into the Draft and leaves the original intact', () => {
    state.update({ nbPizzas: 8, hydrationRatio: 0.68 });
    const dough = service.saveDraft('Document');
    state.update({ nbPizzas: 3, hydrationRatio: 0.55 });
    prefs.set(GUIDED_DRAFT_STORAGE_KEY, { nbPizzas: 6 });

    expect(service.adjust(dough.id)).toBeTrue();
    expect(state.getInput().nbPizzas).toBe(8);
    expect(prefs.get(GUIDED_DRAFT_STORAGE_KEY)).toEqual({ nbPizzas: 6 });

    state.update({ nbPizzas: 12 });
    expect(service.get(dough.id)?.input.nbPizzas).toBe(8);
  });

  it('renames, duplicates and deletes Dough documents', () => {
    const original = service.saveDraft('Saturday');

    expect(service.rename(original.id, 'Sunday')).toBeTrue();
    const duplicate = service.duplicate(original.id, 'Sunday — copy');

    expect(service.list().map(({ name }) => name)).toEqual([
      'Sunday',
      'Sunday — copy',
    ]);
    expect(duplicate).not.toBeNull();
    expect(duplicate?.input).toEqual(service.get(original.id)?.input);

    expect(service.delete(original.id)).toBeTrue();
    expect(service.list().map(({ id }) => id)).toEqual([duplicate!.id]);
  });
});
