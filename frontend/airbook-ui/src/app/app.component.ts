import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container header-inner">
        <a routerLink="/" class="logo">
          <span class="logo-icon">✈</span> iRetail AirBook
        </a>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/search" routerLinkActive="active">Search Flights</a>
          <a routerLink="/bookings" routerLinkActive="active">My Bookings</a>
          <a routerLink="/checkin" routerLinkActive="active">Check-in</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active">Admin CMS</a>
          }
        </nav>
        <div class="auth-area">
          @if (auth.isLoggedIn()) {
            <span class="user">{{ auth.user()?.fullName }}</span>
            <button class="btn btn-outline btn-sm" (click)="auth.logout()">Logout</button>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm">Login</a>
          }
        </div>
      </div>
    </header>
    <main><router-outlet /></main>
    <footer class="footer">
      <div class="container">
        <p>iRetail AirBook Hub — Portfolio project inspired by <a href="https://www.ibsplc.com/" target="_blank">IBS Software</a> airline retail solutions</p>
      </div>
    </footer>
  `,
  styles: [`
    .header { background: var(--navy); color: white; padding: 0.85rem 0; position: sticky; top: 0; z-index: 100; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .logo { color: white; font-weight: 700; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; }
    .logo-icon { color: var(--teal); font-size: 1.4rem; }
    nav { display: flex; gap: 1.25rem; }
    nav a { color: rgba(255,255,255,0.75); font-size: 0.9rem; font-weight: 500; }
    nav a.active, nav a:hover { color: var(--teal); }
    .auth-area { display: flex; align-items: center; gap: 0.75rem; }
    .user { font-size: 0.85rem; opacity: 0.85; }
    .btn-sm { padding: 0.4rem 0.85rem; font-size: 0.85rem; }
    main { min-height: calc(100vh - 120px); padding: 2rem 0; }
    .footer { background: var(--navy-light); color: rgba(255,255,255,0.6); padding: 1.25rem 0; text-align: center; font-size: 0.85rem; }
    .footer a { color: var(--teal); }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
