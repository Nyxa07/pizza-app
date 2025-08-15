import { Component, input, OnInit } from '@angular/core';
import { DoughResult } from '../../services/dough-calculator.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { TranslationKeys } from '../../../../shared/services/translation-keys.service';
import { PIZZA_WEIGHT } from '../../constants';

@Component({
  selector: 'app-dough-direct-recipe',
  templateUrl: './dough-direct-recipe.component.html',
  styleUrls: [
    './dough-direct-recipe.component.scss',
    '../dough-recipe.component.scss',
  ],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
})
export class DoughDirectRecipeComponent implements OnInit {
  result = input.required<DoughResult>();
  TranslationKeys = TranslationKeys;
  protected pizzaWeight = PIZZA_WEIGHT;

  constructor() {}

  ngOnInit() {}
}
