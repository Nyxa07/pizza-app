import { Component, OnInit, inject, Renderer2 } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pizza, settings, helpCircle } from 'ionicons/icons';

import { KonamiService } from 'src/app/shared/services/konami.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  private konamiService = inject(KonamiService);
  private renderer = inject(Renderer2);

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
  async ngOnInit() {
    this.konamiService.watch();
    this.konamiService.isPrideThemeActive$.subscribe((isActive) => {
      const body = document.body;
      if (isActive) {
        this.renderer.addClass(body, 'pride-theme');
      } else {
        this.renderer.removeClass(body, 'pride-theme');
      }
    });
  }
}
