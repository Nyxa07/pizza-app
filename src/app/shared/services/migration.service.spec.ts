import { TestBed } from '@angular/core/testing';

import { FakePrefsStorage } from '../testing/fake-prefs-storage';
import { MigrationService } from './migration.service';
import { PrefsStorage } from './prefs-storage.service';

describe('MigrationService', () => {
  let service: MigrationService;
  let prefs: FakePrefsStorage;

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    service = TestBed.inject(MigrationService);
  });

  it('removes the v1 theming keys and keeps unrelated preferences', () => {
    prefs.set('theme', 'dark');
    prefs.set('public-theme', 'cyberpunk');
    prefs.set('secret-theme', 'konami');
    prefs.set('discovered-themes', ['konami']);
    prefs.set('keepAwake', true);

    service.run();

    expect(prefs.get('theme')).toBeNull();
    expect(prefs.get('public-theme')).toBeNull();
    expect(prefs.get('secret-theme')).toBeNull();
    expect(prefs.get('discovered-themes')).toBeNull();
    expect(prefs.get('keepAwake')).toBeTrue();
  });

  it('handles pristine preferences without crashing', () => {
    expect(() => service.run()).not.toThrow();

    expect(prefs.get('schema-version')).toBe(2);
  });

  it('marks the schema as migrated and never runs twice', () => {
    prefs.set('theme', 'dark');

    service.run();
    expect(prefs.get('schema-version')).toBe(2);
    expect(prefs.get('theme')).toBeNull();

    // A theming key reappearing after migration must survive a second run().
    prefs.set('theme', 'written-after-migration');
    service.run();
    expect(prefs.get('theme')).toBe('written-after-migration');
  });
});
