import { Route } from '@angular/router';

import { CalculatorPath } from 'src/app/features/calculator/enums/calculator-path.enum';

export const CALCULATOR_ROUTES: Route[] = [
  {
    // The app opens straight on the calculation screen: the Expert path.
    path: '',
    redirectTo: CalculatorPath.EXPERT,
    pathMatch: 'full',
  },
  {
    path: CalculatorPath.EXPERT,
    loadComponent: () =>
      import('./expert/expert.page').then((m) => m.CalculatorExpertPage),
  },
  {
    path: CalculatorPath.GUIDED,
    loadComponent: () =>
      import('./guided/guided.page').then((m) => m.CalculatorGuidedPage),
  },
  // The v1 assistant is gone; old deep links enter the Guided path.
  {
    path: 'assistant',
    redirectTo: CalculatorPath.GUIDED,
  },
  // Legacy v1 calculator routes — the Simple/Complex pages and the
  // field-visibility screen are replaced by the Expert screen (issue #71).
  {
    path: 'simple',
    redirectTo: CalculatorPath.EXPERT,
  },
  {
    path: 'complex',
    redirectTo: CalculatorPath.EXPERT,
  },
  {
    path: 'settings',
    redirectTo: CalculatorPath.EXPERT,
  },
  {
    path: 'method',
    loadComponent: () =>
      import('./method/method.page').then((m) => m.CalculatorMethodPage),
  },
  // Legacy v1 results URL — the Method screen replaces it (issue #72).
  {
    path: 'results/:mode',
    redirectTo: 'method',
  },
];
