import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
} from '@ionic/angular/standalone';
import { informationCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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
  ],
})
export class FaqComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

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
