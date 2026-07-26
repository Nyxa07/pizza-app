import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';

import { DoughDefaultsFormComponent } from 'src/app/features/settings/dough-defaults-form/dough-defaults-form.component';
import { LegalInfoComponent } from 'src/app/features/settings/legal-info/legal-info.component';
import { SettingsFormComponent } from 'src/app/features/settings/settings-form/settings-form.component';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    TranslatePipe,
    SettingsFormComponent,
    DoughDefaultsFormComponent,
    LegalInfoComponent,
  ],
})
export class SettingsPage {}
