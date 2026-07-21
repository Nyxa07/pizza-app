import { TestBed } from '@angular/core/testing';

import { PrefsStorage } from './prefs-storage.service';

describe('PrefsStorage', () => {
  let service: PrefsStorage;

  const KEY = 'prefs-storage-spec';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrefsStorage);
  });

  afterEach(() => {
    service.remove(KEY);
  });

  it('round-trips a value', () => {
    service.set(KEY, { hydration: 62 });

    expect(service.get(KEY)).toEqual({ hydration: 62 });
  });

  it('returns null for a missing key', () => {
    expect(service.get(KEY)).toBeNull();
  });

  it('removes a stored value', () => {
    service.set(KEY, 'value');

    service.remove(KEY);

    expect(service.get(KEY)).toBeNull();
  });
});
