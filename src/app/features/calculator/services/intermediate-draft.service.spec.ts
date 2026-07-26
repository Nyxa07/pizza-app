import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { PizzaType } from '../../settings/enums/pizza-type.enum';
import {
  EXPERT_DRAFT_STORAGE_KEY,
  INTERMEDIATE_DRAFT_STORAGE_KEY,
} from './calculator-draft-storage.constants';
import { DoughDefaultsService } from './dough-defaults.service';
import { IntermediateDraftService } from './intermediate-draft.service';

describe('IntermediateDraftService', () => {
  let prefs: FakePrefsStorage;
  let defaults: DoughDefaultsService;
  let service: IntermediateDraftService;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    defaults = TestBed.inject(DoughDefaultsService);
    service = TestBed.inject(IntermediateDraftService);
    service.init();
  });

  it('seeds a new calculation from « Mes pâtes par défaut »', () => {
    expect(service.getDraft()).toEqual({
      pizzaType: PizzaType.NEAPOLITAN,
      nbPizzas: 5,
      // 250 g of factory Default, read back as the size that makes it.
      sizeCm: 28,
      doughType: jasmine.anything(),
      globalRestTime: 24,
      temperature: 20,
      yeastType: jasmine.anything(),
    });
  });

  it('reads the seed size back from the default ball weight', () => {
    defaults.update({ pizzaType: PizzaType.ROMAN, pizzaWeight: 180 });

    service.newCalculation();

    expect(service.getDraft().sizeCm).toBe(31);
  });

  it('persists and resumes its own answers', () => {
    service.update({ sizeCm: 33, nbPizzas: 8 });

    expect(prefs.get(INTERMEDIATE_DRAFT_STORAGE_KEY)).toEqual(
      service.getDraft(),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    const resumed = TestBed.inject(IntermediateDraftService);
    resumed.init();

    expect(resumed.getDraft().sizeCm).toBe(33);
    expect(resumed.getDraft().nbPizzas).toBe(8);
  });

  it('never touches the Expert Draft', () => {
    prefs.set(EXPERT_DRAFT_STORAGE_KEY, { nbPizzas: 12 });

    service.update({ nbPizzas: 3, pizzaType: PizzaType.ROMAN });

    expect(prefs.get(EXPERT_DRAFT_STORAGE_KEY)).toEqual({ nbPizzas: 12 });
  });

  it('brings the size back into range when the style changes', () => {
    service.update({ pizzaType: PizzaType.NEAPOLITAN, sizeCm: 35 });

    service.update({ pizzaType: PizzaType.ROMAN });

    expect(service.getDraft().sizeCm).toBe(33);
  });

  it('reopens a persisted size that is outside its style on the bound', () => {
    prefs.set(INTERMEDIATE_DRAFT_STORAGE_KEY, {
      ...service.getDraft(),
      pizzaType: PizzaType.ROMAN,
      sizeCm: 35,
    });

    service.init();

    expect(service.getDraft().sizeCm).toBe(33);
  });

  it('starts a new calculation from the current Defaults', () => {
    service.update({ nbPizzas: 9, sizeCm: 34 });
    defaults.update({ nbPizzas: 3 });

    service.newCalculation();

    expect(service.getDraft().nbPizzas).toBe(3);
    expect(service.getDraft().sizeCm).toBe(28);
  });
});
