import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./features/invoice-list/invoice-list.component').then(
        (m) => m.InvoiceListComponent
      ),
  },
  {
    path: 'invoice/:id',
    loadComponent: () =>
      import('./features/invoice-detail/invoice-detail.component').then(
        (m) => m.InvoiceDetailComponent
      ),
  },
];
