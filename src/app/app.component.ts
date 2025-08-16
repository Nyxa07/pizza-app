import { Component, inject, OnInit } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenu,
  IonContent,
  IonSplitPane,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { TranslationKeys } from './shared/services/translation-keys.service';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { pizza, settings, helpCircle } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenu,
    IonContent,
    IonSplitPane,
    IonMenuToggle,
    RouterLink,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  protected TranslationKeys = TranslationKeys;
  public appPages = [
    { title: TranslationKeys.DOUGH_ROUTES.TITLE, url: '/dough', icon: 'pizza' },
    {
      title: TranslationKeys.SETTINGS_ROUTES.TITLE,
      url: '/settings',
      icon: 'settings',
    },
    {
      title: TranslationKeys.FAQ_ROUTES.TITLE,
      url: '/faq',
      icon: 'help-circle',
    },
  ];
  constructor() {
    addIcons({
      pizza,
      settings,
      helpCircle,
    });
  }
  async ngOnInit() {}
}
