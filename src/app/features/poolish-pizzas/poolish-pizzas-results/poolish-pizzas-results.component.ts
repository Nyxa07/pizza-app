import { Component, Input, OnInit } from '@angular/core';
import { PoolishPizzaResult } from '../services/poolish-pizza-maker.service';
import {
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonBadge,
  IonItem,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../../../shared/services/translation-keys.service';

@Component({
  selector: 'app-poolish-pizzas-results',
  templateUrl: './poolish-pizzas-results.component.html',
  styleUrls: ['./poolish-pizzas-results.component.scss'],
  imports: [
    IonItemGroup,
    IonItemDivider,
    IonLabel,
    IonBadge,
    IonItem,
    TranslateModule,
  ],
  standalone: true,
})
export class PoolishPizzasResultsComponent implements OnInit {
  @Input({ required: true }) result!: PoolishPizzaResult | null;

  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;

  ngOnInit() {}
}
