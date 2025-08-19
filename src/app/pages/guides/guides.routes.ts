import { Routes } from '@angular/router';

export const GUIDES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index.page').then((m) => m.GuidesIndexPage),
  },
  {
    path: 'faq',
    loadComponent: () => import('./faq/faq.page').then((m) => m.FaqPage),
  },
];
