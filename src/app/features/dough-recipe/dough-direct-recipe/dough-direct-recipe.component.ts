import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { DoughResult } from '../../dough/services/dough-calculator.service';
import { DoughConfigService } from '../../dough/services/dough-config.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

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
  encapsulation: ViewEncapsulation.None,
})
export class DoughDirectRecipeComponent implements OnInit {
  constructor(
    private doughConfigService: DoughConfigService,
    private numberPipe: NumberPipe,
  ) {}

  @Input({ required: true }) result!: DoughResult;
  protected pizzaWeight = this.doughConfigService.constants.pizzaWeight;

  round(value: number, format: string) {
    return this.numberPipe.transform(value, format);
  }

  ngOnInit() {}
}
