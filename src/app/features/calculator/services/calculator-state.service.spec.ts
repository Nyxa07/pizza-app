import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { CalculatorStateService } from './calculator-state.service';
import { DoughDefaultsService } from './dough-defaults.service';

describe('CalculatorStateService (the single Draft)', () => {
  let prefs: FakePrefsStorage;
  let defaults: DoughDefaultsService;
  let state: CalculatorStateService;

  /**
   * A fresh injector over the same storage — an app (re)start, ending
   * with the init() every calculator page triggers.
   */
  const startApp = (): CalculatorStateService => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    defaults = TestBed.inject(DoughDefaultsService);
    const service = TestBed.inject(CalculatorStateService);
    service.init();
    return service;
  };

  beforeEach(() => {
    prefs = new FakePrefsStorage();
  });

  it('a new calculation starts from the user Defaults, not hardcoded values', () => {
    // The user tunes their Defaults from the settings screen before ever
    // opening the calculator: no Draft exists yet.
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    TestBed.inject(DoughDefaultsService).update({ hydrationRatio: 0.7 });

    state = startApp();

    expect(state.getInput().hydrationRatio).toBe(0.7);
  });

  it('the Draft survives an app restart (« Reprendre »)', () => {
    state = startApp();
    state.update({ nbPizzas: 8, hydrationRatio: 0.68 });

    const resumed = startApp();

    expect(resumed.getInput().nbPizzas).toBe(8);
    expect(resumed.getInput().hydrationRatio).toBe(0.68);
  });

  it('is one Draft shared by all paths: re-initing a page keeps it', () => {
    state = startApp();
    state.update({ nbPizzas: 8 });

    // The next calculator page's ngOnInit re-inits the same service.
    state.init();

    expect(state.getInput().nbPizzas).toBe(8);
  });

  it('editing a Default never touches the current Draft (no implicit overwrite)', () => {
    state = startApp();
    state.update({ hydrationRatio: 0.65 });

    defaults.update({ hydrationRatio: 0.8 });

    expect(state.getInput().hydrationRatio).toBe(0.65);
  });

  it('an explicit new calculation restarts the Draft from the current Defaults', () => {
    state = startApp();
    state.update({ hydrationRatio: 0.65, nbPizzas: 8 });
    prefs.set('calculator:guided:step', 6);
    defaults.update({ hydrationRatio: 0.8 });

    state.newCalculation();

    expect(state.getInput().hydrationRatio).toBe(0.8);
    expect(state.getInput().nbPizzas).toBe(5);
    expect(prefs.get('calculator:guided:step')).toBeNull();

    const resumed = startApp();
    expect(resumed.getInput().hydrationRatio).toBe(0.8);
  });

  it('resetting a single field falls back to the user Default', () => {
    state = startApp();
    defaults.update({ saltRatio: 0.03 });
    state.update({ saltRatio: 0.02 });

    state.resetField('saltRatio');

    expect(state.getInput().saltRatio).toBe(0.03);
  });
});
