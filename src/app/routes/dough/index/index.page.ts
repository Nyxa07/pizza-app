import { Component, computed, inject, signal } from '@angular/core';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSegmentView,
  IonSegmentContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { PoolishPizzaFormData } from 'src/app/features/dough/dough-form/dough-form.component';
import { DoughCalculatorService } from 'src/app/features/dough/services/dough-calculator.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DoughFormComponent } from 'src/app/features/dough/dough-form/dough-form.component';
import { DoughQuantityComponent } from 'src/app/features/dough/dough-quantity/dough-quantity.component';
import { DoughPoolishRecipeComponent } from 'src/app/features/dough-recipe/dough-poolish-recipe/dough-poolish-recipe.component';
import { DoughDirectRecipeComponent } from 'src/app/features/dough-recipe/dough-direct-recipe/dough-direct-recipe.component';

@Component({
  selector: 'dough-index-page',
  templateUrl: './index.page.html',
  standalone: true,
  imports: [
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSegmentView,
    IonSegmentContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    TranslatePipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    DoughFormComponent,
    DoughQuantityComponent,
    DoughDirectRecipeComponent,
    DoughPoolishRecipeComponent,
  ],
})
export class DoughIndexPage {
  private readonly doughCalculatorService = inject(DoughCalculatorService);
  private readonly router = inject(Router);
  formData = signal<PoolishPizzaFormData | null>(null);
  result = computed(() =>
    this.formData()
      ? this.doughCalculatorService.compute(this.formData()!)
      : null,
  );
}
