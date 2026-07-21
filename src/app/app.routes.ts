import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Unified settings live outside the tabs: pushed over any tab, no tab bar.
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '',
    loadChildren: () =>
      import('./pages/tabs/tabs.routes').then((m) => m.routes),
  },
];
