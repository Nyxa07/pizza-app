import { Routes } from '@angular/router';

export const FAQ_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index.page').then((m) => m.FaqIndexPage),
  },
];
