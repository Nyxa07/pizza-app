import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';

import { DoughSummaryService } from 'src/app/features/doughs/services/dough-summary.service';
import { RecipeCatalogService } from 'src/app/features/recipes/services/recipe-catalog.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

@Component({
  selector: 'app-recipe-detail-page',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TranslatePipe,
    NumberPipe,
  ],
})
export class RecipeDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(RecipeCatalogService);
  private readonly summaries = inject(DoughSummaryService);

  protected readonly recipe = this.catalog.get(
    this.route.snapshot.paramMap.get('id') ?? '',
  );
  /** The suggested dough facts, resolved through the same seam as a Dough. */
  protected readonly summary = this.recipe
    ? this.summaries.summarize(this.recipe.suggestedDough.input)
    : null;

  protected prepareSuggestedDough(): void {
    if (this.recipe && this.catalog.prepareSuggestedDough(this.recipe.id)) {
      this.router.navigate(['/tabs/calculator/expert']);
    }
  }
}
