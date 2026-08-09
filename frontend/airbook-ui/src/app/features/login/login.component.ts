import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, TagModule, RouterLink],
  template: `
    <div class="container-wide wrap">
      <div class="login-shell">
        <aside class="persona">
          <h1>Role-based access</h1>
          <p>Each persona lands on a dedicated workspace — Traveler, Analyst BI, or Ops CMS.</p>
          <button type="button" class="persona-card" (click)="fill('customer@airbook.com','customer123')">
            <p-tag value="TRAVELER" severity="success"></p-tag>
            <strong>Customer portal</strong>
            <span>Flights · Hotels · Cruise · Concierge · Trips</span>
          </button>
          <button type="button" class="persona-card" (click)="fill('analyst@airbook.com','analyst123')">
            <p-tag value="ANALYST" severity="info"></p-tag>
            <strong>Naviq Retail BI</strong>
            <span>KPIs · Insights · Forecast — Analyst workspace</span>
          </button>
          <button type="button" class="persona-card" (click)="fill('admin@airbook.com','admin123')">
            <p-tag value="ADMIN" severity="warn"></p-tag>
            <strong>Platform Ops</strong>
            <span>Route CMS · Full analytics control</span>
          </button>
        </aside>
        <p-card styleClass="login-card">
          <h2>Sign in</h2>
          <p class="hint">Select a persona. Analyst opens BI; Admin opens CMS; Traveler opens My Journey.</p>
          @if (error) { <p-message severity="error" [text]="error" styleClass="w-full mb"></p-message> }
          <div class="field"><label>Email</label><input pInputText class="w-full" [(ngModel)]="email" type="email"></div>
          <div class="field"><label>Password</label><p-password [(ngModel)]="password" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password></div>
          <p-button label="Enter workspace" icon="pi pi-sign-in" styleClass="w-full" [loading]="loading" (onClick)="login()"></p-button>
          <a routerLink="/" class="back">← Back to platform</a>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .wrap { padding:2rem 0; }
    .login-shell { display:grid; grid-template-columns: 1.15fr 1fr; gap:1.5rem; align-items:stretch; max-width:980px; margin:0 auto; }
    .persona { background: linear-gradient(160deg, #06101c, #0f3248 55%, #0a4038); color:#fff; border-radius:20px; padding:1.6rem; }
    .persona h1 { margin:0 0 .35rem; font-size:1.55rem; }
    .persona > p { opacity:.75; margin:0 0 1.1rem; font-size:.92rem; line-height:1.45; }
    .persona-card { width:100%; text-align:left; display:grid; gap:.25rem; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:1rem 1.05rem; margin-bottom:.7rem; color:#fff; cursor:pointer; }
    .persona-card:hover { border-color:#1ec8b2; background:rgba(30,200,178,.12); }
    .persona-card strong { font-size:.98rem; }
    .persona-card span { font-size:.78rem; opacity:.7; }
    :host ::ng-deep .login-card { height:100%; }
    h2 { margin:0 0 .5rem; color:#06101c; }
    .hint { color:#667; font-size:.85rem; margin-bottom:1rem; line-height:1.45; }
    .field { margin-bottom:1rem; }
    .field label { display:block; font-weight:600; font-size:.8rem; margin-bottom:.3rem; }
    .w-full { width:100%; }
    .mb { margin-bottom:1rem; display:block; }
    .back { display:inline-block; margin-top:1rem; font-size:.85rem; }
    @media (max-width:800px) { .login-shell { grid-template-columns:1fr; } }
  `]
})
export class LoginComponent {
  email = 'customer@airbook.com';
  password = 'customer123';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  fill(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  login() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.router.navigate([this.auth.homeRoute()]); this.loading = false; },
      error: () => { this.error = 'Invalid credentials or API unavailable'; this.loading = false; }
    });
  }
}
