import { Route } from '@angular/router';

export const CALCULATOR_ROUTES: Route[] = [
  {
    // The app opens straight on the calculation screen: the Expert path.
    path: '',
    redirectTo: 'expert',
    pathMatch: 'full',
  },
  {
    path: 'expert',
    loadComponent: () =>
      import('./expert/expert.page').then((m) => m.CalculatorExpertPage),
  },
  {
    path: 'assistant',
    loadComponent: () =>
      import('./assistant/assistant.page').then(
        (m) => m.CalculatorAssistantPage,
      ),
  },
  // Legacy v1 calculator routes — the Simple/Complex pages and the
  // field-visibility screen are replaced by the Expert screen (issue #71).
  {
    path: 'simple',
    redirectTo: 'expert',
  },
  {
    path: 'complex',
    redirectTo: 'expert',
  },
  {
    path: 'settings',
    redirectTo: 'expert',
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
