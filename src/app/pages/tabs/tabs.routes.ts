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
        loadComponent: () =>
          import('../doughs/doughs.page').then((m) => m.DoughsPage),
      },
      {
        // No tab button anymore; stays routable until #70 turns the
        // content into contextual Fiches.
        path: 'guides',
        loadChildren: () =>
          import('../guides/guides.routes').then((m) => m.GUIDES_ROUTES),
      },
      // Legacy v1 routes (menu pages removed by the v2 navigation, #69)
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
