import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { Appearance } from '../enums/appearance.enum';
import { AppearanceService } from './appearance.service';

describe('AppearanceService', () => {
  let service: AppearanceService;
  let prefs: FakePrefsStorage;

  const systemResolved = (): Appearance =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Appearance.Dark
      : Appearance.Light;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    service = TestBed.inject(AppearanceService);
  });

  afterEach(() => {
    delete document.documentElement.dataset['appearance'];
  });

  it('follows the system scheme by default', () => {
    service.init();

    expect(service.appearance()).toBe(Appearance.System);
    expect(document.documentElement.dataset['appearance']).toBe(
      systemResolved(),
    );
  });

  it('applies a persisted preference on init', () => {
    prefs.set('appearance', Appearance.Dark);

    service.init();

    expect(service.appearance()).toBe(Appearance.Dark);
    expect(document.documentElement.dataset['appearance']).toBe(
      Appearance.Dark,
    );
  });

  it('ignores an invalid persisted value and falls back to system', () => {
    prefs.set('appearance', 'cyberpunk');

    service.init();

    expect(service.appearance()).toBe(Appearance.System);
    expect(document.documentElement.dataset['appearance']).toBe(
      systemResolved(),
    );
  });

  it('applies and persists a forced appearance', () => {
    service.init();

    service.setAppearance(Appearance.Dark);
    expect(document.documentElement.dataset['appearance']).toBe(
      Appearance.Dark,
    );
    expect(prefs.get('appearance')).toBe(Appearance.Dark);

    service.setAppearance(Appearance.Light);
    expect(document.documentElement.dataset['appearance']).toBe(
      Appearance.Light,
    );
    expect(prefs.get('appearance')).toBe(Appearance.Light);
  });

  it('resolves a forced preference to itself and system to a concrete rendering', () => {
    service.init();

    service.setAppearance(Appearance.Dark);
    expect(service.resolvedAppearance()).toBe(Appearance.Dark);

    service.setAppearance(Appearance.System);
    expect(service.resolvedAppearance()).toBe(systemResolved());
  });
});
