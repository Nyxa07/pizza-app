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

  it('drops a persisted locale that v2 no longer ships', () => {
    prefs.set('locale:current', 'de');

    service.run();

    expect(prefs.get('locale:current')).toBeNull();
  });

  it('keeps a persisted locale that v2 still supports', () => {
    prefs.set('locale:current', 'fr');

    service.run();

    expect(prefs.get('locale:current')).toBe('fr');
  });

  it('drops a corrupted locale value without crashing', () => {
    prefs.set('locale:current', 42);

    expect(() => service.run()).not.toThrow();

    expect(prefs.get('locale:current')).toBeNull();
  });

  it('handles pristine preferences without crashing', () => {
    expect(() => service.run()).not.toThrow();

    expect(prefs.get('schema-version')).toBe(6);
  });

  it('marks the schema as migrated and never runs twice', () => {
    prefs.set('theme', 'dark');

    service.run();
    expect(prefs.get('schema-version')).toBe(6);
    expect(prefs.get('theme')).toBeNull();

    // A theming key reappearing after migration must survive a second run().
    prefs.set('theme', 'written-after-migration');
    service.run();
    expect(prefs.get('theme')).toBe('written-after-migration');
  });

  it('merges a v1 per-mode draft into the single Draft and drops the silo', () => {
    prefs.set('calculator:simple', { nbPizzas: 7, hydrationRatio: 0.66 });

    service.run();

    expect(prefs.get('calculator:draft')).toEqual({
      nbPizzas: 7,
      hydrationRatio: 0.66,
    });
    expect(prefs.get('calculator:simple')).toBeNull();
  });

  it('several v1 drafts: the most invested mode wins (complex > assist > simple)', () => {
    // v1 drafts carry no timestamp, so "most recent" is unknowable; the
    // migration keeps the draft of the mode exposing the most fields.
    prefs.set('calculator:simple', { nbPizzas: 1 });
    prefs.set('calculator:assist', { nbPizzas: 2 });
    prefs.set('calculator:complex', { nbPizzas: 3 });

    service.run();

    expect(prefs.get('calculator:draft')).toEqual({ nbPizzas: 3 });
    expect(prefs.get('calculator:simple')).toBeNull();
    expect(prefs.get('calculator:assist')).toBeNull();
    expect(prefs.get('calculator:complex')).toBeNull();
  });

  it('an assist draft wins over a simple one', () => {
    prefs.set('calculator:simple', { nbPizzas: 1 });
    prefs.set('calculator:assist', { nbPizzas: 2 });

    service.run();

    expect(prefs.get('calculator:draft')).toEqual({ nbPizzas: 2 });
  });

  it('creates no Draft when there is no v1 draft to merge', () => {
    service.run();

    expect(prefs.get('calculator:draft')).toBeNull();
  });

  it('never overwrites an already-written Draft', () => {
    prefs.set('calculator:draft', { nbPizzas: 9 });
    prefs.set('calculator:complex', { nbPizzas: 3 });

    service.run();

    expect(prefs.get('calculator:draft')).toEqual({ nbPizzas: 9 });
    expect(prefs.get('calculator:complex')).toBeNull();
  });

  it('a user already at schema 2 skips the v1→v2 wipe', () => {
    prefs.set('schema-version', 2);
    // Written after the v1→v2 step ran: must not be wiped again.
    prefs.set('theme', 'written-after-v2');
    prefs.set('calculator:complex', { nbPizzas: 3 });

    service.run();

    expect(prefs.get('theme')).toBe('written-after-v2');
    expect(prefs.get('calculator:draft')).toEqual({ nbPizzas: 3 });
    expect(prefs.get('schema-version')).toBe(6);
  });

  it('drops the per-mode field-visibility settings (issue #71)', () => {
    // The field-visibility screen is gone (ADR-0002): a v1 user who hid
    // fields must not carry those toggles into the Expert screen's engine.
    prefs.set('calculator:settings:simple', { saltRatio: { auto: true } });
    prefs.set('calculator:settings:complex', {
      hydrationRatio: { auto: true, visible: false },
    });
    prefs.set('calculator:settings:assist', { doughType: { auto: false } });
    prefs.set('calculator:defaults', { saltRatio: 0.03 });

    service.run();

    expect(prefs.get('calculator:settings:simple')).toBeNull();
    expect(prefs.get('calculator:settings:complex')).toBeNull();
    expect(prefs.get('calculator:settings:assist')).toBeNull();
    expect(prefs.get('calculator:defaults')).toEqual({ saltRatio: 0.03 });
  });

  it('a user already at schema 3 only gets the settings purge', () => {
    prefs.set('schema-version', 3);
    // A silo reappearing after the v2→v3 merge must not be re-merged.
    prefs.set('calculator:complex', { nbPizzas: 3 });
    prefs.set('calculator:settings:complex', { saltRatio: { auto: true } });

    service.run();

    expect(prefs.get('calculator:draft')).toBeNull();
    expect(prefs.get('calculator:complex')).toEqual({ nbPizzas: 3 });
    expect(prefs.get('calculator:settings:complex')).toBeNull();
    expect(prefs.get('schema-version')).toBe(6);
  });

  it('drops the retired assistant state without touching the shared Draft', () => {
    prefs.set('schema-version', 4);
    prefs.set('assistant:data', { nbPizzas: 2 });
    prefs.set('assistant:currentStepIndex', 3);
    prefs.set('calculator:draft', { nbPizzas: 7 });

    service.run();

    expect(prefs.get('assistant:data')).toBeNull();
    expect(prefs.get('assistant:currentStepIndex')).toBeNull();
    expect(prefs.get('calculator:draft')).toEqual({ nbPizzas: 7 });
    expect(prefs.get('schema-version')).toBe(6);
  });

  it('merges every v1 named-save silo into one Dough list without loss', () => {
    prefs.set('calculator:complex:states', [
      { name: 'Saturday', input: { nbPizzas: 8 } },
    ]);
    prefs.set('calculator:assist:states', [
      { name: 'Saturday', input: { nbPizzas: 4 } },
    ]);
    prefs.set('calculator:simple:states', [
      { name: 'Quick', input: { nbPizzas: 2 } },
    ]);

    service.run();

    const doughs =
      prefs.get<{ id: string; name: string; input: { nbPizzas: number } }[]>(
        'calculator:doughs',
      );
    expect(doughs?.map(({ name }) => name)).toEqual([
      'Saturday',
      'Saturday',
      'Quick',
    ]);
    expect(doughs?.map(({ input }) => input.nbPizzas)).toEqual([8, 4, 2]);
    expect(new Set(doughs?.map(({ id }) => id)).size).toBe(3);
    expect(prefs.get('calculator:complex:states')).toBeNull();
    expect(prefs.get('calculator:assist:states')).toBeNull();
    expect(prefs.get('calculator:simple:states')).toBeNull();
  });

  it('appends legacy saves to an existing Dough list without overwriting it', () => {
    prefs.set('schema-version', 5);
    prefs.set('calculator:doughs', [
      {
        id: 'existing',
        name: 'Existing',
        input: { nbPizzas: 6 },
        createdAt: null,
        updatedAt: null,
      },
    ]);
    prefs.set('calculator:complex:states', [
      { name: 'Legacy', input: { nbPizzas: 3 } },
    ]);
    // A key from an older step must not be touched when only v5→v6 runs.
    prefs.set('assistant:data', { nbPizzas: 12 });

    service.run();

    const doughs = prefs.get<{ name: string }[]>('calculator:doughs');
    expect(doughs?.map(({ name }) => name)).toEqual(['Existing', 'Legacy']);
    expect(prefs.get('assistant:data')).toEqual({ nbPizzas: 12 });
    expect(prefs.get('schema-version')).toBe(6);
  });

  it('drops malformed legacy entries without blocking valid saves', () => {
    prefs.set('calculator:simple:states', [
      null,
      { name: '', input: { nbPizzas: 1 } },
      { name: 'Valid', input: { nbPizzas: 2 } },
    ]);

    expect(() => service.run()).not.toThrow();

    expect(
      prefs
        .get<{ name: string }[]>('calculator:doughs')
        ?.map(({ name }) => name),
    ).toEqual(['Valid']);
  });
});
