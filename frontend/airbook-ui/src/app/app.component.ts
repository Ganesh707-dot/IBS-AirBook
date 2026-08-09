import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TagModule, ToastModule],
  template: `
    <p-toast position="top-right"></p-toast>
    <header class="topbar">
      <div class="container topbar-inner">
        <a routerLink="/" class="brand">
          <i class="pi pi-send"></i>
          <div>
            <strong>AirBook</strong>
            <small>Airline Retail Platform</small>
          </div>
        </a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/search" routerLinkActive="active">Flights</a>
          <a routerLink="/tracker" routerLinkActive="active">Live Tracker</a>

          @if (auth.isCustomer() || (!auth.isLoggedIn())) {
            @if (auth.isLoggedIn()) {
              <a routerLink="/dashboard" routerLinkActive="active">My Dashboard</a>
              <a routerLink="/bookings" routerLinkActive="active">My Trips</a>
              <a routerLink="/checkin" routerLinkActive="active">Check-in</a>
            }
          }

          @if (auth.canAccessBi()) {
            <a routerLink="/bi" routerLinkActive="active">AI BI</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active">Admin CMS</a>
          }
        </nav>
        <div class="auth">
          @if (auth.isLoggedIn()) {
            <p-tag [severity]="roleSeverity()" [value]="roleLabel()"></p-tag>
            <span class="uname">{{ auth.user()?.fullName }}</span>
            <p-button label="Logout" severity="secondary" [outlined]="true" size="small" (onClick)="auth.logout()"></p-button>
          } @else {
            <a routerLink="/login"><p-button label="Login" size="small"></p-button></a>
          }
        </div>
      </div>
    </header>
    <main class="main"><router-outlet /></main>
    <footer class="footer">
      <div class="container footer-inner">
        <span>AirBook · RBAC: Customer · Analyst · Admin · OOSD</span>
        <a href="https://opensky-network.org/api/states/all" target="_blank" rel="noopener">OpenSky Live API</a>
      </div>
    </footer>
  `,
  styles: [`
    .topbar { background: linear-gradient(90deg, #071526, #0f2a44); color: #fff; position: sticky; top: 0; z-index: 1000; box-shadow: 0 8px 24px rgba(7,21,38,.25); }
    .topbar-inner { display:flex; align-items:center; justify-content:space-between; gap:1rem; min-height:68px; }
    .brand { display:flex; align-items:center; gap:.75rem; color:#fff; }
    .brand i { color: #00b4a0; font-size: 1.4rem; }
    .brand strong { display:block; line-height:1.1; }
    .brand small { opacity:.7; font-size:.72rem; }
    .nav { display:flex; gap:1rem; flex-wrap:wrap; }
    .nav a { color: rgba(255,255,255,.78); font-weight:600; font-size:.9rem; }
    .nav a.active, .nav a:hover { color:#00b4a0; }
    .auth { display:flex; align-items:center; gap:.6rem; }
    .uname { color: rgba(255,255,255,.85); font-size: .85rem; font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .main { min-height: calc(100vh - 130px); padding: 1.5rem 0 2.5rem; }
    .footer { background:#0f2438; color:rgba(255,255,255,.65); padding:1rem 0; }
    .footer-inner { display:flex; justify-content:space-between; gap:1rem; font-size:.85rem; }
    @media (max-width: 900px) {
      .topbar-inner { flex-direction:column; align-items:flex-start; padding: .85rem 1.25rem; }
      .nav { gap:.75rem; }
      .uname { display: none; }
    }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}

  roleLabel() {
    const r = this.auth.role();
    if (r === 'ADMIN') return 'ADMIN';
    if (r === 'ANALYST') return 'ANALYST';
    if (r === 'CUSTOMER') return 'CUSTOMER';
    return r || 'USER';
  }

  roleSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (this.auth.isAdmin()) return 'warn';
    if (this.auth.isAnalyst()) return 'info';
    return 'success';
  }
}
