import type { Provider, Type } from '@angular/core';
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

import { DoughsPage } from './doughs.page';
import { DoughDetailPage } from './dough-detail.page';

const DOUGH_ID = 'from-guided';

describe('DoughDetailPage (the document and its card cannot diverge)', () => {
  let prefs: FakePrefsStorage;

  /**
   * Both surfaces are mounted in turn against the same stored library, so the
   * comparison below is between two real renderings, not between two readings
   * of the same service.
   */
  const mount = <T>(
    page: Type<T>,
    providers: Provider[] = [],
  ): ComponentFixture<T> => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [page],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: prefs },
        ...providers,
      ],
    });

    const fixture = TestBed.createComponent(page);
    fixture.detectChanges();
    return fixture;
  };

  const openedDocument = (): ComponentFixture<DoughDetailPage> =>
    mount(DoughDetailPage, [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap({ id: DOUGH_ID }) },
        },
      },
    ]);

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

  const textsOf = <T>(
    fixture: ComponentFixture<T>,
    selector: string,
  ): string[] =>
    fixture.debugElement
      .queryAll(By.css(selector))
      .map((element) =>
        ((element.nativeElement as HTMLElement).textContent ?? '').trim(),
      );

  const percentIn = (texts: string[]): string => {
    const match = /([\d\s.,]+)%/.exec(texts.join(' '));
    expect(match)
      .withContext(`a percentage in "${texts.join(' ')}"`)
      .not.toBeNull();
    return (match?.[1] ?? '').trim();
  };

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    seedGuidedDough();
  });

  it('announces the same hydration as the library card', () => {
    const onTheCard = percentIn(textsOf(mount(DoughsPage), '.document-meta'));

    const onTheDocument = percentIn(textsOf(openedDocument(), '.fact-grid dd'));

    expect(onTheDocument).toBe(onTheCard);
  });

  it('fills its four facts without a hole', () => {
    const facts = textsOf(openedDocument(), '.fact-grid dd');

    expect(facts.length).toBe(4);
    for (const fact of facts) {
      expect(fact).toMatch(/\d/);
    }
  });
});
