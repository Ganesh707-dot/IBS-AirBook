import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'search', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'bookings', canActivate: [authGuard], loadComponent: () => import('./features/bookings/bookings.component').then(m => m.BookingsComponent) },
  { path: 'checkin', canActivate: [authGuard], loadComponent: () => import('./features/checkin/checkin.component').then(m => m.CheckinComponent) },
  { path: 'tracker', loadComponent: () => import('./features/tracker/tracker.component').then(m => m.TrackerComponent) },
  { path: 'admin', canActivate: [authGuard], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: 'bi', canActivate: [authGuard], loadComponent: () => import('./features/bi/bi.component').then(m => m.BiComponent) },
  { path: '**', redirectTo: '' }
];
