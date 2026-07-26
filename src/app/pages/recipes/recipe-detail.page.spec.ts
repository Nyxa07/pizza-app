import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';

import { provideTranslateService } from '@ngx-translate/core';

import {
  PIZZA_RECIPE_CATALOG,
  SUGGESTED_DOUGHS,
} from 'src/app/features/recipes/recipes.catalog';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { RecipeDetailPage } from './recipe-detail.page';

describe('RecipeDetailPage (the suggested dough facts)', () => {
  const facts = (recipeId: string): string[] => {
    TestBed.configureTestingModule({
      imports: [RecipeDetailPage],
      providers: [
        provideIonicAngular({ animated: false }),
        provideTranslateService(),
        provideRouter([]),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: recipeId }) },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(RecipeDetailPage);
    fixture.detectChanges();
    return fixture.debugElement
      .queryAll(By.css('.dough-facts dd'))
      .map((dd) =>
        ((dd.nativeElement as HTMLElement).textContent ?? '').trim(),
      );
  };

  it('shows a resolved hydration and keeps the rest time as a total', () => {
    const recipe = PIZZA_RECIPE_CATALOG[0];
    const suggested = SUGGESTED_DOUGHS.find(
      (dough) => dough.id === recipe.suggestedDoughId,
    );

    const [balls, hydration, rest] = facts(recipe.id);

    expect(balls).toMatch(/\d/);
    expect(hydration).toMatch(/[1-9]\d*%/);
    // The Recipe sheet keeps showing the global rest, not the ambient/cold split.
    expect(rest).toBe(`${suggested?.input.globalRestTime} h`);
  });
});
