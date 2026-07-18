import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { routes } from './app.routes';

describe('App navigation (v2)', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideIonicAngular({ animated: false }),
        provideHttpClient(),
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    });

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it('opens directly on the calculation screen', async () => {
    await harness.navigateByUrl('/');

    expect(router.url).toBe('/tabs/calculator/expert');
  });

  it('serves the calculation screen at the calculator tab root (no index menu)', async () => {
    await harness.navigateByUrl('/tabs/calculator');

    expect(router.url).toBe('/tabs/calculator/expert');
  });

  it('redirects the legacy home menu to the calculation screen', async () => {
    await harness.navigateByUrl('/tabs/home');

    expect(router.url).toBe('/tabs/calculator/expert');
  });

  it('redirects the legacy app-settings page to the unified settings screen', async () => {
    await harness.navigateByUrl('/tabs/home/settings');

    expect(router.url).toBe('/settings');
  });

  it('redirects the dissolved guides tab to the calculation screen', async () => {
    await harness.navigateByUrl('/tabs/guides/faq');

    expect(router.url).toBe('/tabs/calculator/expert');
  });

  it('redirects the retired simple and complex calculators to the Expert screen', async () => {
    await harness.navigateByUrl('/tabs/calculator/simple');
    expect(router.url).toBe('/tabs/calculator/expert');

    await harness.navigateByUrl('/tabs/calculator/complex');
    expect(router.url).toBe('/tabs/calculator/expert');
  });

  it('redirects the removed field-visibility screen to the Expert screen', async () => {
    await harness.navigateByUrl('/tabs/calculator/settings');

    expect(router.url).toBe('/tabs/calculator/expert');
  });

  it('resolves the unified settings screen with the settings form', async () => {
    await harness.navigateByUrl('/settings');

    expect(router.url).toBe('/settings');
    expect(
      harness.routeNativeElement?.querySelector('app-settings-form'),
    ).toBeTruthy();
  });

  it('resolves the recipes tab placeholder', async () => {
    await harness.navigateByUrl('/tabs/recipes');

    expect(router.url).toBe('/tabs/recipes');
  });

  it('resolves the doughs tab placeholder', async () => {
    await harness.navigateByUrl('/tabs/doughs');

    expect(router.url).toBe('/tabs/doughs');
  });
});
