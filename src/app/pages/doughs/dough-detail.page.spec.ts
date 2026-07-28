import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import { GUIDED_PATH } from 'src/app/features/calculator/paths/guided.path';
import { DoughDefaultsService } from 'src/app/features/calculator/services/dough-defaults.service';
import type { Dough } from 'src/app/features/doughs/interfaces/dough.interface';
import { DOUGHS_STORAGE_KEY } from 'src/app/features/doughs/services/doughs.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughDetailPage } from './dough-detail.page';

const DOUGH_ID = 'from-guided';

/**
 * The document a saved Dough opens as. Whether its figures agree with the ones
 * on the library card is no longer a question a screen can answer: both read
 * the Dough facts module, and its own spec pins the figures.
 */
describe('DoughDetailPage', () => {
  let prefs: FakePrefsStorage;

  const openedDocument = (): ComponentFixture<DoughDetailPage> => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DoughDetailPage],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: prefs },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: DOUGH_ID }) },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(DoughDetailPage);
    fixture.detectChanges();
    return fixture;
  };

  /** Seeds the library with a single Dough saved from the Guided path. */
  const seedGuidedDough = (): void => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PrefsStorage, useValue: prefs }],
    });
    const defaults = TestBed.inject(DoughDefaultsService).getDefaults();
    const dough: Dough = {
      id: DOUGH_ID,
      name: 'Samedi',
      input: GUIDED_PATH.toInput(GUIDED_PATH.seed(defaults), defaults),
      createdAt: '2026-07-26T10:00:00.000Z',
      updatedAt: '2026-07-26T10:00:00.000Z',
    };
    prefs.set(DOUGHS_STORAGE_KEY, [dough]);
  };

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    seedGuidedDough();
  });

  it('fills its four facts without a hole', () => {
    const facts = openedDocument()
      .debugElement.queryAll(By.css('.fact-grid dd'))
      .map((dd) => ((dd.nativeElement as HTMLElement).textContent ?? '').trim());

    expect(facts.length).toBe(4);
    for (const fact of facts) {
      expect(fact).toMatch(/\d/);
    }
  });
});
