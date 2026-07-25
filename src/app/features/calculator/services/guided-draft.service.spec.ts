import { TestBed } from '@angular/core/testing';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
import { UNKNOWN_FLOUR_STRENGTH } from '../interfaces/guided-calculator-draft.interface';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';
import {
  EXPERT_DRAFT_STORAGE_KEY,
  GUIDED_DRAFT_STORAGE_KEY,
  GUIDED_STEP_STORAGE_KEY,
} from './calculator-draft-storage.constants';
import { GuidedDraftService } from './guided-draft.service';

describe('GuidedDraftService', () => {
  let prefs: FakePrefsStorage;
  let service: GuidedDraftService;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    service = TestBed.inject(GuidedDraftService);
    service.init();
  });

  it('starts independently with unknown flour resolved later as W270', () => {
    expect(service.getDraft().flourStrengthChoice).toBe(UNKNOWN_FLOUR_STRENGTH);
    expect(prefs.get(GUIDED_DRAFT_STORAGE_KEY)).toEqual(service.getDraft());
  });

  it('persists Guided answers without touching Expert', () => {
    prefs.set(EXPERT_DRAFT_STORAGE_KEY, {
      pizzaType: PizzaType.NEAPOLITAN,
      flourStrength: 350,
    });

    service.update({
      pizzaType: PizzaType.ROMAN,
      flourStrengthChoice: 320,
    });

    expect(service.getDraft().pizzaType).toBe(PizzaType.ROMAN);
    expect(service.getDraft().flourStrengthChoice).toBe(320);
    expect(
      prefs.get<{ flourStrength: number }>(EXPERT_DRAFT_STORAGE_KEY)
        ?.flourStrength,
    )
      .withContext('Expert Draft')
      .toBe(350);
  });

  it('new calculation resets only Guided answers and its step', () => {
    service.update({ nbPizzas: 9, flourStrengthChoice: 350 });
    prefs.set(GUIDED_STEP_STORAGE_KEY, 7);
    prefs.set(EXPERT_DRAFT_STORAGE_KEY, { nbPizzas: 12 });

    service.newCalculation();

    expect(service.getDraft().nbPizzas).toBe(5);
    expect(service.getDraft().flourStrengthChoice).toBe(UNKNOWN_FLOUR_STRENGTH);
    expect(prefs.get(GUIDED_STEP_STORAGE_KEY)).toBeNull();
    expect(prefs.get(EXPERT_DRAFT_STORAGE_KEY)).toEqual({ nbPizzas: 12 });
  });
});
