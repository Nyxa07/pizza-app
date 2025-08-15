import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { informationCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationKeys } from 'src/app/shared/services/translation-keys.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  imports: [
    IonButton,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    TranslatePipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
  ],
})
export class FaqComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  TranslationKeys = TranslationKeys;

  constructor() {
    addIcons({ informationCircle });
  }

  ngOnInit() {}

  onWillDismiss(event: any) {
    console.log('onWillDismiss', event);
  }

  cancel() {
    this.modal.dismiss();
  }

  confirm() {
    this.modal.dismiss();
  }
}
