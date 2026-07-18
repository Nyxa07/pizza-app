import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughDefaultsService } from './dough-defaults.service';

describe('DoughDefaultsService', () => {
  let prefs: FakePrefsStorage;
  let service: DoughDefaultsService;

  /** A fresh injector over the same storage — an app (re)start. */
  const startApp = (): DoughDefaultsService => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    return TestBed.inject(DoughDefaultsService);
  };

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    service = startApp();
  });

  it('serves the factory values when the user has customised nothing', () => {
    const defaults = service.getDefaults();

    expect(defaults.hydrationRatio).toBe(0.62);
    expect(defaults.saltRatio).toBe(0.028);
    expect(defaults.pizzaWeight).toBe(250);
    expect(defaults.nbPizzas).toBe(5);
  });

  it('a customised value survives an app restart, the rest stays factory', () => {
    service.update({ hydrationRatio: 0.7 });

    const restarted = startApp();
    const defaults = restarted.getDefaults();

    expect(defaults.hydrationRatio).toBe(0.7);
    expect(defaults.saltRatio).toBe(0.028);
  });
});
