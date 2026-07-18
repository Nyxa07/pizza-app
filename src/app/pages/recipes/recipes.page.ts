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
import { LucideAngularModule, PizzaIcon, SettingsIcon } from 'lucide-angular';

@Component({
  selector: 'app-recipes-page',
  templateUrl: './recipes.page.html',
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
export class RecipesPage {
  protected readonly PizzaIcon = PizzaIcon;
  protected readonly SettingsIcon = SettingsIcon;
}
