import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonGrid,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonRow,
  IonCardContent,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'guides-index-page',
  templateUrl: './index.page.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslatePipe,
    IonButtons,
    IonGrid,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonRow,
    IonCardContent,
    IonBackButton,
    RouterLink,
  ],
})
export class GuidesIndexPage {}
