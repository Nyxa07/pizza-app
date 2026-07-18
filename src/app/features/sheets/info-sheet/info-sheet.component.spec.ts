import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { InfoSheetId } from '../enums/info-sheet-id.enum';
import { InfoSheetComponent } from './info-sheet.component';

describe('InfoSheetComponent', () => {
  const createSheet = (
    sheetId: InfoSheetId,
  ): ComponentFixture<InfoSheetComponent> => {
    const prefs = new FakePrefsStorage();
    prefs.set('locale:current', 'fr');
    TestBed.configureTestingModule({
      imports: [InfoSheetComponent],
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: prefs },
      ],
    });

    const fixture = TestBed.createComponent(InfoSheetComponent);
    fixture.componentInstance.sheetId = sheetId;
    fixture.detectChanges();
    return fixture;
  };

  it('renders the Fiche title, subtitle, paragraphs and tip', () => {
    const fixture = createSheet(InfoSheetId.HYDRATION);
    const text = fixture.nativeElement.textContent;

    expect(fixture.debugElement.query(By.css('.fiche__title'))).toBeTruthy();
    expect(text).toContain("L'hydratation");
    expect(text).toContain("Le ratio entre la quantité d'eau totale");
    expect(text).toContain('Ex. 1 : pour 100 g');
    expect(text).toContain('Hydratation recommandée');
  });

  it('renders no tip block when the Fiche has no tip', () => {
    const fixture = createSheet(InfoSheetId.TEMPERATURE);

    expect(fixture.debugElement.query(By.css('.fiche__tip'))).toBeNull();
  });

  it('links the sibling method Fiches, and swaps in place when followed', () => {
    const fixture = createSheet(InfoSheetId.POOLISH);

    const links = fixture.debugElement.queryAll(
      By.css('.fiche__related-links ion-button'),
    );
    const labels = links.map((link) =>
      (link.nativeElement.textContent as string).trim(),
    );
    expect(labels).toEqual(['La méthode directe', 'La biga']);

    links[1].nativeElement.click();
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('.fiche__title')).nativeElement
        .textContent,
    ).toContain('La biga');
  });

  it('offers no related links outside the method Fiches', () => {
    const fixture = createSheet(InfoSheetId.YEASTS);

    expect(fixture.debugElement.query(By.css('.fiche__related'))).toBeNull();
  });
});
