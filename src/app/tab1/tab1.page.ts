import { Component, computed, inject, signal } from '@angular/core';
import {
  IonContent,
  IonSegmentView,
  IonSegmentContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import {
  PoolishPizzaFormData,
  DoughFormComponent,
} from '../features/dough/dough-form/dough-form.component';
import { DoughQuantityComponent } from '../features/dough/dough-quantity/dough-quantity.component';
import { addIcons } from 'ionicons';
import { pizza, settings } from 'ionicons/icons';
import { DoughPoolishRecipeComponent } from '../features/dough/dough-poolish-recipe/dough-poolish-recipe.component';
import { ToolbarSegmentsService } from '../shared/services/toolbar-segments.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationKeys } from '../shared/services/translation-keys.service';
import { DoughCalculatorService } from '../features/dough/services/dough-calculator.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonContent,
    DoughFormComponent,
    DoughQuantityComponent,
    IonSegmentView,
    IonSegmentContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    DoughPoolishRecipeComponent,
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

  protected doughCalculatorService = inject(DoughCalculatorService);
  data = signal<PoolishPizzaFormData | null>(null);
  result = computed(() => {
    return this.doughCalculatorService.compute(this.data()!);
  });
}
