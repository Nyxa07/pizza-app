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

  protected readonly recipe = this.catalog.get(
    this.route.snapshot.paramMap.get('id') ?? '',
  );
  protected readonly restHours = this.recipe
    ? (this.recipe.suggestedDough.input.globalRestTime ??
      (this.recipe.suggestedDough.input.rtRestTime ?? 0) +
        (this.recipe.suggestedDough.input.coldRestTime ?? 0))
    : 0;

  protected prepareSuggestedDough(): void {
    if (this.recipe && this.catalog.prepareSuggestedDough(this.recipe.id)) {
      this.router.navigate(['/tabs/calculator/expert']);
    }
  }
}
