import { Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import {
  HouseIcon,
  CalculatorIcon,
  BookIcon,
  LucideAngularModule,
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
    IonLabel,
    LucideAngularModule,
  ],
})
export class TabsPage {
  HouseIcon = HouseIcon;
  CalculatorIcon = CalculatorIcon;
  BookIcon = BookIcon;
  constructor() {
    LucideAngularModule.pick({ HouseIcon });
  }
}
