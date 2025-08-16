import { Route } from '@angular/router';

export const SETTINGS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index.component').then(
        (m) => m.SettingsIndexRouteComponent,
      ),
  },
];
