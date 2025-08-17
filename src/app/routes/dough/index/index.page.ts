import { Component } from '@angular/core';
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
import { TranslatePipe } from '@ngx-translate/core';
import { DoughFormComponent } from 'src/app/features/dough/dough-form/dough-form.component';
import { DoughQuantityComponent } from 'src/app/features/dough/dough-quantity/dough-quantity.component';
import { DoughFormStateService } from 'src/app/features/dough/services/dough-form-state.service';
import { DoughRecipeComponent } from 'src/app/features/dough-recipe/dough-recipe.component';

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
    DoughRecipeComponent,
  ],
})
export class DoughIndexPage {
  constructor(private resultDataStore: DoughFormStateService) {}
}
