import { Component, input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { DoughResult } from '../../services/dough-calculator.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../../../../shared/services/translation-keys.service';
import { PIZZA_WEIGHT } from '../../constants';

@Component({
  selector: 'app-dough-poolish-recipe',
  templateUrl: './dough-poolish-recipe.component.html',
  styleUrls: ['./dough-poolish-recipe.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    TranslateModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DoughPoolishRecipeComponent implements OnInit {
  result = input.required<DoughResult>();
  constructor() {}

  protected pizzaWeight = PIZZA_WEIGHT;

  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;

  ngOnInit() {}
}
