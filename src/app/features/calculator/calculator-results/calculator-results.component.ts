import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleManagerService } from '../../locales/services/locale-manager.service';
import { AsyncPipe } from '@angular/common';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';
import {
  IonLabel,
  IonItem,
  IonListHeader,
  IonList,
  IonBadge,
  IonNote,
} from '@ionic/angular/standalone';
import {
  LucideAngularModule,
  WheatIcon,
  DropletsIcon,
  CandyCaneIcon,
  BeerIcon,
  SpotlightIcon,
} from 'lucide-angular';
import { filter, map } from 'rxjs';
import { CalculatorStateService } from '../services/calculator-state.service';

@Component({
  selector: 'app-calculator-results',
  templateUrl: './calculator-results.component.html',
  styleUrls: ['./calculator-results.component.scss'],
  imports: [
    TranslateModule,
    AsyncPipe,
    NumberPipe,
    IonLabel,
    IonItem,
    IonListHeader,
    IonList,
    LucideAngularModule,
    IonNote,
  ],
  standalone: true,
})
export class CalculatorResultsComponent implements OnInit {
  readonly WheatIcon = WheatIcon;
  readonly DropletsIcon = DropletsIcon;
  readonly CandyCaneIcon = CandyCaneIcon;
  readonly BeerIcon = BeerIcon;
  readonly SpotlightIcon = SpotlightIcon;

  protected currentLocale = this.localeManager.getLocale();
  protected result$ = this.calculatorState.result$;
  protected poolishData$ = this.result$.pipe(
    filter((result) => !!result?.poolish),
    map((result) => [
      {
        icon: this.WheatIcon,
        value: result?.poolish?.flour,
        label: 'common.ingredients.flour',
        unit: 'g',
      },
      {
        icon: this.DropletsIcon,
        value: result?.poolish?.water,
        label: 'common.ingredients.water',
        unit: 'g',
      },
      {
        icon: this.BeerIcon,
        value: result?.poolish?.yeast,
        label: 'common.ingredients.yeast',
        unit: 'g',
        numberFormat: '1.0-2',
      },
      {
        icon: this.CandyCaneIcon,
        value: result?.poolish?.honey,
        label: 'common.ingredients.honey',
        unit: 'g',
      },
    ]),
  );

  protected doughData$ = this.result$.pipe(
    map((result) => [
      {
        icon: this.WheatIcon,
        value: result?.dough?.flour,
        label: 'common.ingredients.flour',
        unit: 'g',
      },
      {
        icon: this.DropletsIcon,
        value: result?.dough?.water,
        label: 'common.ingredients.water',
        unit: 'g',
      },
      {
        icon: this.BeerIcon,
        value: result?.dough?.yeast,
        label: 'common.ingredients.yeast',
        unit: 'g',
        numberFormat: '1.0-2',
      },
      {
        icon: this.CandyCaneIcon,
        value: result?.dough?.honey,
        label: 'common.ingredients.honey',
        unit: 'g',
      },
      {
        icon: this.SpotlightIcon,
        value: result?.dough?.salt,
        label: 'common.ingredients.salt',
        unit: 'g',
      },
    ]),
  );

  constructor(
    private localeManager: LocaleManagerService,
    private calculatorState: CalculatorStateService,
  ) {}

  ngOnInit() {}

  round(value: number) {
    return Math.round(value);
  }
}
