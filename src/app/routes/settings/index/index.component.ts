import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsFormComponent } from 'src/app/features/settings/settings-form/settings-form.component';

@Component({
  selector: 'route-settings-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    TranslatePipe,
    SettingsFormComponent,
    IonContent,
  ],
})
export class SettingsIndexRouteComponent implements OnInit {
  ngOnInit() {}
}
