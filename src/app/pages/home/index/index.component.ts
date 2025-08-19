import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-index-page',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    TranslatePipe,
    IonContent,
    IonButton,
    IonButtons,
    LucideAngularModule,
    RouterLink,
  ],
})
export class HomeIndexPage implements OnInit {
  readonly SettingsIcon = SettingsIcon;
  ngOnInit() {}
}
