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
import { PoolishPizzaMakerService } from '../features/dough/services/poolish-pizza-maker.service';
import {
  PoolishPizzaFormData,
  DoughFormComponent,
} from '../features/dough/dough-form/dough-form.component';
import { PoolishPizzasResultsComponent } from '../features/dough/poolish-pizzas-results/poolish-pizzas-results.component';
import { addIcons } from 'ionicons';
import { pizza, settings } from 'ionicons/icons';
import { PoolishPizzasRecipeComponent } from '../features/dough/poolish-pizzas-recipe/poolish-pizzas-recipe.component';
import { ToolbarSegmentsService } from '../shared/services/toolbar-segments.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationKeys } from '../shared/services/translation-keys.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonContent,
    DoughFormComponent,
    PoolishPizzasResultsComponent,
    IonSegmentView,
    IonSegmentContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    PoolishPizzasRecipeComponent,
    TranslateModule,
  ],
})
export class Tab1Page {
  protected toolbarSegmentsService = inject(ToolbarSegmentsService);

  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;
  protected translateService = inject(TranslateService);

  constructor() {
    addIcons({ settings, pizza });
    this.toolbarSegmentsService.setSegments([
      {
        name: TranslationKeys.TAB1.SEGMENTS.DATA,
        value: 'data',
      },
      {
        name: TranslationKeys.TAB1.SEGMENTS.RECIPE,
        value: 'recipe',
      },
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
