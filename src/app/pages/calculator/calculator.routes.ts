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
  {
    path: CalculatorPath.INTERMEDIATE,
    loadComponent: () =>
      import('./intermediate/intermediate.page').then(
        (m) => m.CalculatorIntermediatePage,
      ),
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
    path: 'method/guided',
    data: { calculatorPath: CalculatorPath.GUIDED },
    loadComponent: () =>
      import('./method/method.page').then((m) => m.CalculatorMethodPage),
  },
  {
    path: 'method/intermediate',
    data: { calculatorPath: CalculatorPath.INTERMEDIATE },
    loadComponent: () =>
      import('./method/method.page').then((m) => m.CalculatorMethodPage),
  },
  {
    path: 'method/expert',
    data: { calculatorPath: CalculatorPath.EXPERT },
    loadComponent: () =>
      import('./method/method.page').then((m) => m.CalculatorMethodPage),
  },
  {
    path: 'method',
    data: { calculatorPath: CalculatorPath.EXPERT },
    loadComponent: () =>
      import('./method/method.page').then((m) => m.CalculatorMethodPage),
  },
  // Legacy v1 results URL — the Method screen replaces it (issue #72).
  {
    path: 'results/:mode',
    redirectTo: 'method',
  },
];
