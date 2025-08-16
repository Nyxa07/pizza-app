import { Component, OnInit } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationKeys } from 'src/app/shared/services/translation-keys.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  imports: [
    TranslatePipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
  ],
})
export class FaqComponent implements OnInit {
  TranslationKeys = TranslationKeys;
  questionsData = TranslationKeys.FAQ.QUESTIONS;

  ngOnInit() {}
}
