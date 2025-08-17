import { Component, inject, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleManagerService } from '../../locales/services/locale-manager.service';
import { DoughFormStateService } from '../services/dough-form-state.service';
import { AsyncPipe } from '@angular/common';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCol,
  IonRow,
  IonChip,
  IonGrid,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-dough-quantity',
  templateUrl: './dough-quantity.component.html',
  styleUrls: ['./dough-quantity.component.scss'],
  imports: [
    TranslateModule,
    AsyncPipe,
    NumberPipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCol,
    IonRow,
    IonChip,
    IonGrid,
    IonLabel,
  ],
  standalone: true,
})
export class DoughQuantityComponent implements OnInit {
  protected currentLocale = this.localeManager.getLocale();
  protected result$ = this.resultDataStore.result$;

  constructor(
    private localeManager: LocaleManagerService,
    private resultDataStore: DoughFormStateService,
  ) {}
  ngOnInit() {}

  round(value: number) {
    return Math.round(value);
  }
}
