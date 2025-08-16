import { Route } from '@angular/router';

export const DOUGH_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./index/index.page').then((m) => m.DoughIndexPage),
  },
];
