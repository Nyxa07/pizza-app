import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { PoolishPizzaResult } from '../services/poolish-pizza-maker.service';
import { PIZZA_WEIGHT } from '../constants';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../../../shared/services/translation-keys.service';

@Component({
  selector: 'app-poolish-pizzas-recipe',
  templateUrl: './poolish-pizzas-recipe.component.html',
  styleUrls: ['./poolish-pizzas-recipe.component.scss'],
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
})
export class PoolishPizzasRecipeComponent implements OnInit {
  result = input.required<PoolishPizzaResult>();
  constructor() {}

  protected pizzaWeight = PIZZA_WEIGHT;

  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;

  ngOnInit() {}
}
