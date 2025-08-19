import { Route } from '@angular/router';

export const CALCULATOR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index.page').then((m) => m.CalculatorIndexPage),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./results/results.page').then((m) => m.CalculatorResultsPage),
  },
];
