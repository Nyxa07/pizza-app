import { Component } from '@angular/core';
import { FaqComponent } from 'src/app/features/faq/faq.component';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { TranslationKeys } from 'src/app/shared/services/translation-keys.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'faq-index-page',
  templateUrl: './index.page.html',
  standalone: true,
  imports: [
    FaqComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslatePipe,
    IonButtons,
    IonMenuButton,
  ],
})
export class FaqIndexPage {
  TranslationKeys = TranslationKeys;
}
