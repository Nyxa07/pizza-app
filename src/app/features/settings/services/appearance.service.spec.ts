import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { Capacitor, SystemBarsStyle } from '@capacitor/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { Appearance } from '../enums/appearance.enum';
import { AppearanceService } from './appearance.service';
import { NATIVE_SYSTEM_BARS_CLIENTS } from './native-system-bars.service';

describe('AppearanceService', () => {
  let service: AppearanceService;
  let prefs: FakePrefsStorage;
  let isNativePlatformSpy: jasmine.Spy;
  let setSystemBarsStyleSpy: jasmine.Spy;
  let setStatusBarColorSpy: jasmine.Spy;
  let setNavigationBarColorSpy: jasmine.Spy;
  let isSystemDark: boolean;
  let notifySchemeChange: (() => void) | undefined;

  beforeEach(() => {
    isSystemDark = false;
    notifySchemeChange = undefined;
    spyOn(window, 'matchMedia').and.callFake(
      (query: string): MediaQueryList =>
        ({
          matches: isSystemDark,
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: (
            _type: string,
            listener: EventListenerOrEventListenerObject,
          ) => {
            notifySchemeChange = () => {
              const event = new Event('change');
              if (typeof listener === 'function') {
                listener(event);
              } else {
                listener.handleEvent(event);
              }
            };
          },
          removeEventListener: () => undefined,
          dispatchEvent: () => true,
        }) as MediaQueryList,
    );
    isNativePlatformSpy = spyOn(Capacitor, 'isNativePlatform').and.returnValue(
      false,
    );
    setSystemBarsStyleSpy = jasmine
      .createSpy('setSystemBarsStyle')
      .and.resolveTo();
    setStatusBarColorSpy = jasmine
      .createSpy('setStatusBarColor')
      .and.resolveTo();
    setNavigationBarColorSpy = jasmine
      .createSpy('setNavigationBarColor')
      .and.resolveTo();

    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      providers: [
        { provide: PrefsStorage, useValue: prefs },
        {
          provide: NATIVE_SYSTEM_BARS_CLIENTS,
          useValue: {
            systemBars: { setStyle: setSystemBarsStyleSpy },
            edgeToEdge: {
              setStatusBarColor: setStatusBarColorSpy,
              setNavigationBarColor: setNavigationBarColorSpy,
            },
          },
        },
      ],
    });
    service = TestBed.inject(AppearanceService);
  });

  afterEach(() => {
    delete document.documentElement.dataset['appearance'];
    document.documentElement.style.removeProperty('--bg');
  });

  it('follows the system scheme by default', () => {
    service.init();

    expect(service.appearance()).toBe(Appearance.System);
    expect(document.documentElement.dataset['appearance']).toBe(
      Appearance.Light,
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
      Appearance.Light,
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
    expect(service.resolvedAppearance()).toBe(Appearance.Light);
  });

  it('does not call native system bars on the web', fakeAsync(() => {
    service.init();
    flushMicrotasks();

    expect(setSystemBarsStyleSpy).not.toHaveBeenCalled();
    expect(setStatusBarColorSpy).not.toHaveBeenCalled();
    expect(setNavigationBarColorSpy).not.toHaveBeenCalled();
  }));

  it('applies dark native content and background for light appearance', fakeAsync(() => {
    isNativePlatformSpy.and.returnValue(true);
    document.documentElement.style.setProperty('--bg', '#faf7f2');

    service.setAppearance(Appearance.Light);
    flushMicrotasks();

    expect(setSystemBarsStyleSpy).toHaveBeenCalledOnceWith({
      style: SystemBarsStyle.Light,
    });
    expect(setStatusBarColorSpy).toHaveBeenCalledOnceWith({
      color: '#faf7f2',
    });
    expect(setNavigationBarColorSpy).toHaveBeenCalledOnceWith({
      color: '#faf7f2',
    });
  }));

  it('applies light native content and background for dark appearance', fakeAsync(() => {
    isNativePlatformSpy.and.returnValue(true);
    document.documentElement.style.setProperty('--bg', '#15151d');

    service.setAppearance(Appearance.Dark);
    flushMicrotasks();

    expect(setSystemBarsStyleSpy).toHaveBeenCalledOnceWith({
      style: SystemBarsStyle.Dark,
    });
    expect(setStatusBarColorSpy).toHaveBeenCalledOnceWith({
      color: '#15151d',
    });
    expect(setNavigationBarColorSpy).toHaveBeenCalledOnceWith({
      color: '#15151d',
    });
  }));

  it('updates native system bars when the followed system scheme changes', fakeAsync(() => {
    isNativePlatformSpy.and.returnValue(true);
    service.init();
    flushMicrotasks();
    setSystemBarsStyleSpy.calls.reset();

    isSystemDark = true;
    notifySchemeChange?.();
    flushMicrotasks();

    expect(document.documentElement.dataset['appearance']).toBe(
      Appearance.Dark,
    );
    expect(setSystemBarsStyleSpy).toHaveBeenCalledOnceWith({
      style: SystemBarsStyle.Dark,
    });
  }));

  it('does not set native background colors when the computed token is absent', fakeAsync(() => {
    isNativePlatformSpy.and.returnValue(true);
    spyOn(window, 'getComputedStyle').and.returnValue({
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration);

    service.init();
    flushMicrotasks();

    expect(setSystemBarsStyleSpy).toHaveBeenCalled();
    expect(setStatusBarColorSpy).not.toHaveBeenCalled();
    expect(setNavigationBarColorSpy).not.toHaveBeenCalled();
  }));

  it('warns without interrupting appearance changes when native sync fails', fakeAsync(() => {
    const error = new Error('native system bars unavailable');
    const warnSpy = spyOn(console, 'warn');
    isNativePlatformSpy.and.returnValue(true);
    setSystemBarsStyleSpy.and.rejectWith(error);

    expect(() => service.setAppearance(Appearance.Dark)).not.toThrow();
    flushMicrotasks();

    expect(service.appearance()).toBe(Appearance.Dark);
    expect(document.documentElement.dataset['appearance']).toBe(
      Appearance.Dark,
    );
    expect(warnSpy).toHaveBeenCalledOnceWith(
      'Failed to sync system bars with appearance:',
      error,
    );
  }));
});
