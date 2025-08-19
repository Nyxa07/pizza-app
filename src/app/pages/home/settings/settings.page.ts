import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsFormComponent } from 'src/app/features/settings/settings-form/settings-form.component';

@Component({
  selector: 'home-settings-page',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TranslateModule,
    SettingsFormComponent,
    IonButtons,
    IonBackButton,
  ],
})
export class HomeSettingsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
