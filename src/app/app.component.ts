import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pizza, settings, helpCircle } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
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
