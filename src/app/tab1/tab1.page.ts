import { Component, computed, inject, model } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSegmentView,
  IonSegmentContent,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { PoolishPizzaMakerService } from '../features/poolish-pizzas/services/poolish-pizza-maker.service';
import {
  PoolishPizzaFormData,
  PoolishPizzasFormComponent,
} from '../features/poolish-pizzas/poolish-pizzas-form/poolish-pizzas-form.component';
import { PoolishPizzasResultsComponent } from '../features/poolish-pizzas/poolish-pizzas-results/poolish-pizzas-results.component';
import { addIcons } from 'ionicons';
import { pizza, settings } from 'ionicons/icons';
import { PoolishPizzasRecipeComponent } from '../features/poolish-pizzas/poolish-pizzas-recipe/poolish-pizzas-recipe.component';
import { LanguageSwitcherComponent } from '../shared/components/language-switcher/language-switcher.component';
import { ToolbarSegmentsService } from '../shared/services/toolbar-segments.service';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonContent,
    PoolishPizzasFormComponent,
    PoolishPizzasResultsComponent,
    IonSegmentView,
    IonSegmentContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    PoolishPizzasRecipeComponent,
  ],
})
export class Tab1Page {
  protected toolbarSegmentsService = inject(ToolbarSegmentsService);

  constructor() {
    addIcons({ settings, pizza });
    this.toolbarSegmentsService.setSegments([
      { name: 'Données', value: 'data' },
      { name: 'Préparation', value: 'recipe' },
    ]);
  }

  protected makePizzaService = inject(PoolishPizzaMakerService);
  data = model<PoolishPizzaFormData | null>(null);
  result = computed(() => {
    // if (this.data() === null) {
    //   return null;
    // }
    return this.makePizzaService.compute(this.data()!);
  });
}
