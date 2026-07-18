import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { LibraryIcon, LucideAngularModule, SettingsIcon } from 'lucide-angular';

@Component({
  selector: 'app-doughs-page',
  templateUrl: './doughs.page.html',
  styleUrls: ['../tab-placeholder.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    TranslatePipe,
    LucideAngularModule,
    RouterLink,
  ],
})
export class DoughsPage {
  protected readonly LibraryIcon = LibraryIcon;
  protected readonly SettingsIcon = SettingsIcon;
}
