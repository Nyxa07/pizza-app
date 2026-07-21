import { Injectable, inject } from '@angular/core';

import { Locales } from 'src/app/features/settings/enums/locales.enum';
import { LocaleManagerService } from 'src/app/features/settings/services/locale-manager.service';
import enSheets from 'src/assets/i18n/en/sheets.json';
import frSheets from 'src/assets/i18n/fr/sheets.json';

import { InfoSheetId } from '../enums/info-sheet-id.enum';
import type { IInfoSheetContent } from '../interfaces/info-sheet-content.interface';

/** A tappable reference to another Fiche (« Voir aussi »). */
export interface IInfoSheetLink {
  id: InfoSheetId;
  title: string;
}

// Bundled statically rather than fetched: the Fiches are core UX opened
// mid-input, they may never miss or arrive late (issue #70).
const CONTENT: Record<Locales, Record<InfoSheetId, IInfoSheetContent>> = {
  [Locales.EN]: enSheets,
  [Locales.FR]: frSheets,
};

// The dough-method Fiches cross-reference each other so the reader can
// compare approaches — it also keeps the Biga reachable, since the
// calculator has no biga field of its own.
const RELATED: Partial<Record<InfoSheetId, readonly InfoSheetId[]>> = {
  [InfoSheetId.DIRECT]: [InfoSheetId.POOLISH, InfoSheetId.BIGA],
  [InfoSheetId.POOLISH]: [InfoSheetId.DIRECT, InfoSheetId.BIGA],
  [InfoSheetId.BIGA]: [InfoSheetId.DIRECT, InfoSheetId.POOLISH],
};

/**
 * Serves the Fiches (info sheets) content in the active locale (issue #70).
 */
@Injectable({ providedIn: 'root' })
export class InfoSheetContentService {
  private readonly localeManager = inject(LocaleManagerService);

  getContent(id: InfoSheetId): IInfoSheetContent {
    return CONTENT[this.localeManager.getLocale()][id];
  }

  /** Sibling Fiches offered as « Voir aussi » links below the given one. */
  getRelated(id: InfoSheetId): IInfoSheetLink[] {
    return (RELATED[id] ?? []).map((relatedId) => ({
      id: relatedId,
      title: this.getContent(relatedId).title,
    }));
  }
}
