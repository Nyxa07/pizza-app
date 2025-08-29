import { Route } from '@angular/router';

export const CALCULATOR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index.page').then((m) => m.CalculatorIndexPage),
  },
  {
    path: 'simple',
    loadComponent: () =>
      import('./simple/simple.page').then((m) => m.CalculatorSimplePage),
  },
  {
    path: 'complex',
    loadComponent: () =>
      import('./complex/complex.page').then((m) => m.CalculatorComplexPage),
  },
  {
    path: 'planner',
    loadComponent: () =>
      import('./planner/planner.page').then((m) => m.CalculatorPlannerPage),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./results/results.page').then((m) => m.CalculatorResultsPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.page').then((m) => m.CalculatorSettingsPage),
  },
];
