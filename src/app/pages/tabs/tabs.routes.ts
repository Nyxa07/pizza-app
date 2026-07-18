import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'calculator',
        loadChildren: () =>
          import('../calculator/calculator.routes').then(
            (m) => m.CALCULATOR_ROUTES,
          ),
      },
      {
        path: 'recipes',
        loadComponent: () =>
          import('../recipes/recipes.page').then((m) => m.RecipesPage),
      },
      {
        path: 'doughs',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../doughs/doughs.page').then((m) => m.DoughsPage),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../doughs/dough-detail.page').then(
                (m) => m.DoughDetailPage,
              ),
          },
        ],
      },
      // Legacy v1 routes (menu pages removed by the v2 navigation, #69;
      // guides tab dissolved into contextual Fiches, #70)
      {
        path: 'guides',
        redirectTo: '/tabs/calculator',
      },
      {
        path: 'home/settings',
        redirectTo: '/settings',
      },
      {
        path: 'home',
        redirectTo: '/tabs/calculator',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: '/tabs/calculator',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/calculator',
    pathMatch: 'full',
  },
];
