import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {
  provideTranslateService,
  TranslateCompiler,
} from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';
import { LocaleManagerService } from './app/features/locales/services/locale-manager.service';
import { provideMultiTranslateLoader } from './app/features/locales/services/translation.loader';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { ThemeService } from './app/features/theme/services/theme.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideTranslateService({
      loader: provideMultiTranslateLoader(),
      fallbackLang: 'en',
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler,
      },
    }),
    provideAppInitializer(() => {
      const themeService = inject(ThemeService);
      themeService.init();

      const localeInitService = inject(LocaleManagerService);
      return localeInitService.init();
    }),
  ],
});
