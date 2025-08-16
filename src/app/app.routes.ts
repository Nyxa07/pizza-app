import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dough',
    pathMatch: 'full',
  },
  {
    path: 'dough',
    loadChildren: () =>
      import('./routes/dough/dough.routes').then((m) => m.DOUGH_ROUTES),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./routes/settings/settings.routes').then(
        (m) => m.SETTINGS_ROUTES,
      ),
  },
  {
    path: 'faq',
    loadChildren: () =>
      import('./routes/faq/faq.routes').then((m) => m.FAQ_ROUTES),
  },
];
