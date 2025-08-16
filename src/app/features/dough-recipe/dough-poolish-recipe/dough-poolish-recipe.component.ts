import {
  Component,
  inject,
  Input,
  input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { DoughResult } from '../../dough/services/dough-calculator.service';

@Component({
  selector: 'app-dough-poolish-recipe',
  templateUrl: './dough-poolish-recipe.component.html',
  styleUrls: [
    './dough-poolish-recipe.component.scss',
    '../dough-recipe.component.scss',
  ],
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
  @Input({ required: true }) result!: DoughResult;
  ngOnInit() {}
}
