import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pizza, settings, helpCircle } from 'ionicons/icons';

import { ThemeService } from 'src/app/features/settings/services/theme.service';
import { KonamiService } from 'src/app/shared/services/konami.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private konamiService = inject(KonamiService);

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
    // Initialize themes from localStorage (dark mode + secret themes)
    this.themeService.init();

    // Start listening for Konami code easter egg
    this.konamiService.watch();
  }
}
