import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipse, square, bug } from 'ionicons/icons';
import { LanguageSwitcherComponent } from '../shared/components/language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../shared/services/translation-keys.service';
import { ToolbarSegmentsComponent } from '../shared/components/toolbar-segments.component/toolbar-segments.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    LanguageSwitcherComponent,
    TranslateModule,
    ToolbarSegmentsComponent,
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;

  constructor() {
    addIcons({ bug, ellipse, square });
  }
}
