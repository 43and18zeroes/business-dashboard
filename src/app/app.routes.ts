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
    path: 'new-customers',
    title: 'New Customers - Business Dashboard',
    loadComponent: () => import('./pages/new-customers-page/new-customers-page').then((m) => m.NewCustomersPage),
  },
  {
    path: 'transactions',
    title: 'Transactions - Business Dashboard',
    loadComponent: () => import('./pages/transactions-page/transactions-page').then((m) => m.TransactionsPage),
  },
  {
    path: 'world-map',
    title: 'World Map - Business Dashboard',
    loadComponent: () => import('./pages/world-map-page/world-map-page').then((m) => m.WorldMapPage),
  },
  {
    path: 'calendar',
    title: 'Calendar - Business Dashboard',
    loadComponent: () => import('./pages/calendar-page/calendar-page').then((m) => m.CalendarPage),
  },
  {
    path: 'info',
    title: 'Info - Business Dashboard',
    loadComponent: () => import('./pages/info-page/info-page').then((m) => m.InfoPage),
  },
  {
    path: '**',
    title: '404 - Page not found - Business Dashboard',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
