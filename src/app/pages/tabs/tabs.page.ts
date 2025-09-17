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
  LucideAngularModule,
  NotebookIcon,
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
  NotebookIcon = NotebookIcon;

}
