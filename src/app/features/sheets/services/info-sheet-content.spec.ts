import { TestBed } from '@angular/core/testing';

import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { collectKeys } from 'src/app/shared/testing/collect-keys';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';
import enSheets from 'src/assets/i18n/en/sheets.json';
import frSheets from 'src/assets/i18n/fr/sheets.json';

import { InfoSheetId } from '../enums/info-sheet-id.enum';
import type { IInfoSheetContent } from '../interfaces/info-sheet-content.interface';
import { InfoSheetContentService } from './info-sheet-content.service';

/**
 * Every Fiche ships complete in both locales (issue #70): all nine ids
 * present, no empty or padded text, and FR/EN structural parity.
 */
describe('Fiches content (FR + EN)', () => {
  const ids = Object.values(InfoSheetId);
  const catalogs: {
    name: string;
    catalog: Record<InfoSheetId, IInfoSheetContent>;
  }[] = [
    { name: 'fr', catalog: frSheets },
    { name: 'en', catalog: enSheets },
  ];

  for (const { name, catalog } of catalogs) {
    describe(`"${name}" catalog`, () => {
      it('ships exactly the nine Fiches', () => {
        expect(Object.keys(catalog).sort()).toEqual([...ids].sort());
      });

      for (const id of ids) {
        it(`ships a complete "${id}" Fiche`, () => {
          const sheet = catalog[id];

          expect(sheet.title.trim()).toBe(sheet.title);
          expect(sheet.title.length).toBeGreaterThan(0);
          expect(sheet.body.length).toBeGreaterThan(0);
          for (const text of [
            ...sheet.body,
            ...(sheet.tips ?? []),
            ...(sheet.subtitle === undefined ? [] : [sheet.subtitle]),
          ]) {
            expect(text.trim().length).toBeGreaterThan(0);
          }
        });
      }
    });
  }

  it('ships the same structure in French and English', () => {
    expect(collectKeys(frSheets).sort()).toEqual(collectKeys(enSheets).sort());
  });
});

describe('InfoSheetContentService', () => {
  const setup = (locale: string): InfoSheetContentService => {
    const prefs = new FakePrefsStorage();
    prefs.set('locale:current', locale);
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: prefs },
      ],
    });
    return TestBed.inject(InfoSheetContentService);
  };

  it('serves a Fiche in the persisted locale', () => {
    const service = setup('fr');

    expect(service.getContent(InfoSheetId.HYDRATION).title).toBe(
      "L'hydratation",
    );
  });

  it('falls back to English for an unshipped locale', () => {
    const service = setup('de');

    expect(service.getContent(InfoSheetId.HYDRATION).title).toBe('Hydration');
  });

  it('cross-references the dough-method Fiches, keeping the Biga reachable', () => {
    const service = setup('fr');

    expect(service.getRelated(InfoSheetId.DIRECT)).toEqual([
      { id: InfoSheetId.POOLISH, title: 'La poolish' },
      { id: InfoSheetId.BIGA, title: 'La biga' },
    ]);
    expect(service.getRelated(InfoSheetId.HYDRATION)).toEqual([]);
  });
});
