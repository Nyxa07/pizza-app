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
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipse, square, bug } from 'ionicons/icons';
import { LanguageSwitcherComponent } from '../shared/components/language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationKeys } from '../shared/services/translation-keys.service';
import { ToolbarSegmentsService } from '../shared/services/toolbar-segments.service';

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
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  protected toolbarSegmentsService = inject(ToolbarSegmentsService);
  protected segments = this.toolbarSegmentsService.getSegments();
  // Make TranslationKeys available in template
  protected TranslationKeys = TranslationKeys;

  constructor() {
    addIcons({ bug, ellipse, square });
  }
}
