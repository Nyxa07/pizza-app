import { Component } from '@angular/core';

import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';
import {
  CalculatorIcon,
  LibraryIcon,
  LucideAngularModule,
  PizzaIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    TranslateModule,
    LucideAngularModule,
  ],
})
export class TabsPage {
  protected readonly CalculatorIcon = CalculatorIcon;
  protected readonly PizzaIcon = PizzaIcon;
  protected readonly LibraryIcon = LibraryIcon;
}
