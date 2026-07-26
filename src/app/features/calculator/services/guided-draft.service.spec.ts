import { TestBed } from '@angular/core/testing';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
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

  /** The step through the stream, the only surface the Guided form consumes. */
  const stepIndex = (): number => {
    let current = -1;
    service
      .getStepIndex$()
      .subscribe((index) => {
        current = index;
      })
      .unsubscribe();
    return current;
  };

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    service = TestBed.inject(GuidedDraftService);
    service.init();
  });

  it('starts independently, holding only the answers it asks for', () => {
    expect(Object.keys(service.getDraft()).sort()).toEqual([
      'doughType',
      'globalRestTime',
      'nbPizzas',
      'pizzaType',
      'temperature',
      'yeastType',
    ]);
    expect(prefs.get(GUIDED_DRAFT_STORAGE_KEY)).toEqual(service.getDraft());
  });

  it('persists Guided answers without touching Expert', () => {
    prefs.set(EXPERT_DRAFT_STORAGE_KEY, {
      pizzaType: PizzaType.NEAPOLITAN,
      flourStrength: 350,
    });

    service.update({
      pizzaType: PizzaType.ROMAN,
      nbPizzas: 3,
    });

    expect(service.getDraft().pizzaType).toBe(PizzaType.ROMAN);
    expect(service.getDraft().nbPizzas).toBe(3);
    expect(
      prefs.get<{ flourStrength: number }>(EXPERT_DRAFT_STORAGE_KEY)
        ?.flourStrength,
    )
      .withContext('Expert Draft')
      .toBe(350);
  });

  it('new calculation resets only Guided answers and its step', () => {
    service.update({ nbPizzas: 9, pizzaType: PizzaType.ROMAN });
    service.setStepIndex(6);
    prefs.set(EXPERT_DRAFT_STORAGE_KEY, { nbPizzas: 12 });

    service.newCalculation();

    expect(service.getDraft().nbPizzas).toBe(5);
    expect(service.getDraft().pizzaType).toBe(PizzaType.NEAPOLITAN);
    expect(stepIndex()).toBe(0);
    expect(prefs.get(GUIDED_STEP_STORAGE_KEY)).toBe(0);
    expect(prefs.get(EXPERT_DRAFT_STORAGE_KEY)).toEqual({ nbPizzas: 12 });
  });

  it('notifies subscribers of every step change, reset included', () => {
    const seen: number[] = [];
    service.getStepIndex$().subscribe((index) => seen.push(index));

    service.setStepIndex(4);
    service.newCalculation();

    expect(seen).toEqual([0, 4, 0]);
  });

  it('persists the step and reloads it on every init', () => {
    service.setStepIndex(3);
    expect(prefs.get(GUIDED_STEP_STORAGE_KEY)).toBe(3);

    // Ionic caches the Guided page, so entering it re-inits the service.
    prefs.set(GUIDED_STEP_STORAGE_KEY, 5);
    service.init();

    expect(stepIndex()).toBe(5);
  });

  it('falls back to the first step when the persisted step is unusable', () => {
    prefs.set(GUIDED_STEP_STORAGE_KEY, 'summary');
    service.init();
    expect(stepIndex()).withContext('not a number').toBe(0);

    prefs.set(GUIDED_STEP_STORAGE_KEY, -2);
    service.init();
    expect(stepIndex()).withContext('negative').toBe(0);
  });
});
