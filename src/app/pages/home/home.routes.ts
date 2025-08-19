import { Route } from '@angular/router';

export const HOME_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index.component').then((m) => m.HomeIndexPage),
  },
];
