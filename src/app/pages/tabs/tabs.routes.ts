import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'calculator',
        loadChildren: () =>
          import('../calculator/calculator.routes').then(
            (m) => m.CALCULATOR_ROUTES,
          ),
      },
      {
        path: 'guides',
        loadChildren: () =>
          import('../guides/guides.routes').then((m) => m.GUIDES_ROUTES),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
