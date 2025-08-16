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
// Translation keys are now referenced directly as strings (see i18n re-organisation).
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
  public appPages = [
    { title: 'route.dough.index.title', url: '/dough', icon: 'pizza' },
    { title: 'route.settings.index.title', url: '/settings', icon: 'settings' },
    { title: 'route.faq.index.title', url: '/faq', icon: 'help-circle' },
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
