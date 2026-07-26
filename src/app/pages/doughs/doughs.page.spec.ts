import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import type { ICalculatorInput } from 'src/app/features/calculator/interfaces/calculator-input.interface';
import { DoughDefaultsService } from 'src/app/features/calculator/services/dough-defaults.service';
import { GuidedDraftService } from 'src/app/features/calculator/services/guided-draft.service';
import { GuidedInputAdapter } from 'src/app/features/calculator/services/guided-input.adapter';
import type { Dough } from 'src/app/features/doughs/interfaces/dough.interface';
import { DOUGHS_STORAGE_KEY } from 'src/app/features/doughs/services/doughs.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughsPage } from './doughs.page';

describe('DoughsPage (a saved Dough is never shown incomplete)', () => {
  let prefs: FakePrefsStorage;

  const savedDough = (id: string, input: ICalculatorInput): Dough => ({
    id,
    name: id,
    input,
    createdAt: '2026-07-26T10:00:00.000Z',
    updatedAt: '2026-07-26T10:00:00.000Z',
  });

  const seedLibrary = (): void => {
    const guided = TestBed.inject(GuidedInputAdapter).resolve(
      TestBed.inject(GuidedDraftService).getDraft(),
    );
    const expert = {
      ...TestBed.inject(DoughDefaultsService).getDefaults(),
      hydrationRatio: 0.68,
    };

    prefs.set(DOUGHS_STORAGE_KEY, [
      savedDough('from-guided', guided),
      savedDough('from-expert', expert),
    ]);
  };

  const metaTexts = (fixture: ComponentFixture<DoughsPage>): string[] => {
    fixture.detectChanges();
    return fixture.debugElement
      .queryAll(By.css('.document-meta'))
      .map((meta) => (meta.nativeElement as HTMLElement).textContent ?? '');
  };

  beforeEach(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      imports: [DoughsPage],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: prefs },
      ],
    });
  });

  it('shows an hydration on a Dough saved from Guided as on one saved from Expert', () => {
    seedLibrary();

    const metas = metaTexts(TestBed.createComponent(DoughsPage));

    expect(metas.length).toBe(2);
    for (const meta of metas) {
      expect(meta).withContext('hydration on the card').toContain('%');
    }
  });

  it('never shows a waterless « 0 % » Dough', () => {
    seedLibrary();

    const metas = metaTexts(TestBed.createComponent(DoughsPage));

    for (const meta of metas) {
      expect(meta).not.toMatch(/(^|[^\d])0\s*%/);
    }
  });
});
