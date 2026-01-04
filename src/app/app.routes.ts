import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Business Dashboard',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'monthly-sales',
    title: 'Monthly Sales - Business Dashboard',
    loadComponent: () => import('./pages/monthly-sales-page/monthly-sales-page').then((m) => m.MonthlySalesPage),
  },
  {
    path: '**',
    title: '404 - Page not found - Business Dashboard',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
