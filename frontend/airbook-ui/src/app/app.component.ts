import { Component, HostListener } from '@angular/core';
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
      <div class="container-wide topbar-inner">
        <a routerLink="/" class="brand">
          <span class="mark">IBS</span>
          <div>
            <strong>AirBook Platform</strong>
            <small>Passenger · Hospitality · Cruise · Cargo · Loyalty · AI</small>
          </div>
        </a>

        <nav class="nav">
          <div class="mega" (mouseenter)="solutionsOpen = true" (mouseleave)="solutionsOpen = false">
            <button type="button" class="mega-btn" [class.open]="solutionsOpen">Solutions</button>
            @if (solutionsOpen) {
              <div class="mega-panel">
                <a routerLink="/search" (click)="solutionsOpen=false"><i class="pi pi-send"></i><div><b>iFly Passenger</b><span>Offer → Order retail</span></div></a>
                <a routerLink="/stays" (click)="solutionsOpen=false"><i class="pi pi-building"></i><div><b>iStay Hotels</b><span>Luxury hospitality</span></div></a>
                <a routerLink="/cruise" (click)="solutionsOpen=false"><i class="pi pi-compass"></i><div><b>iTravel Cruise</b><span>Shore-to-ship</span></div></a>
                <a routerLink="/cargo" (click)="solutionsOpen=false"><i class="pi pi-box"></i><div><b>iCargo</b><span>Air cargo lanes</span></div></a>
                <a routerLink="/loyalty" (click)="solutionsOpen=false"><i class="pi pi-star"></i><div><b>iLoyal</b><span>Member engagement</span></div></a>
                <a routerLink="/concierge" (click)="solutionsOpen=false"><i class="pi pi-sparkles"></i><div><b>Naviq Concierge</b><span>AI tourist assist</span></div></a>
                <a routerLink="/tracker" (click)="solutionsOpen=false"><i class="pi pi-map"></i><div><b>iFlight Ops</b><span>Live sky map</span></div></a>
                @if (auth.canAccessBi()) {
                  <a routerLink="/bi" (click)="solutionsOpen=false"><i class="pi pi-chart-line"></i><div><b>Retail BI</b><span>Analyst intelligence</span></div></a>
                }
              </div>
            }
          </div>

          <a routerLink="/search" routerLinkActive="active">Flights</a>
          <a routerLink="/stays" routerLinkActive="active">Hotels</a>
          <a routerLink="/cruise" routerLinkActive="active">Cruise</a>
          <a routerLink="/concierge" routerLinkActive="active">AI Concierge</a>

          @if (auth.isCustomer()) {
            <a routerLink="/dashboard" routerLinkActive="active">My Journey</a>
            <a routerLink="/bookings" routerLinkActive="active">Trips</a>
            <a routerLink="/checkin" routerLinkActive="active">Check-in</a>
          }
          @if (auth.isAnalyst() && !auth.isAdmin()) {
            <a routerLink="/bi" routerLinkActive="active">Analyst BI</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/bi" routerLinkActive="active">AI BI</a>
            <a routerLink="/admin" routerLinkActive="active">Ops CMS</a>
          }
        </nav>

        <div class="auth">
          @if (auth.isLoggedIn()) {
            <p-tag [severity]="roleSeverity()" [value]="roleLabel()"></p-tag>
            <span class="uname">{{ auth.user()?.fullName }}</span>
            <p-button label="Logout" severity="secondary" [outlined]="true" size="small" (onClick)="auth.logout()"></p-button>
          } @else {
            <a routerLink="/login"><p-button label="Sign in" size="small"></p-button></a>
          }
        </div>
      </div>
    </header>

    <main class="main"><router-outlet /></main>

    <footer class="footer">
      <div class="container-wide foot-grid">
        <div>
          <strong>AirBook by IBS-style architecture</strong>
          <p>Modular airline + hospitality platform: iFly · iStay · iTravel · iCargo · iLoyal · Naviq AI.</p>
        </div>
        <div class="links">
          <a routerLink="/stays">Hotels</a>
          <a routerLink="/cruise">Cruise</a>
          <a routerLink="/cargo">Cargo</a>
          <a routerLink="/loyalty">Loyalty</a>
          <a routerLink="/concierge">AI Concierge</a>
        </div>
        <div class="meta">© 2026 AirBook demo · Inspired by IBS Software domains</div>
      </div>
    </footer>
  `,
  styles: [`
    .topbar { background: linear-gradient(90deg, #050d18, #0c2238 55%, #0a2e2a); color:#fff; position:sticky; top:0; z-index:1200; border-bottom:1px solid rgba(255,255,255,.08); }
    .topbar-inner { display:flex; align-items:center; justify-content:space-between; gap:1rem; min-height:74px; }
    .brand { display:flex; align-items:center; gap:.75rem; color:#fff; }
    .mark { display:grid; place-items:center; width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg,#1ec8b2,#c4a35a); color:#06101c; font-weight:800; font-size:.85rem; }
    .brand strong { display:block; line-height:1.1; }
    .brand small { opacity:.65; font-size:.68rem; }
    .nav { display:flex; gap:.85rem; flex-wrap:wrap; align-items:center; }
    .nav > a { color: rgba(255,255,255,.78); font-weight:600; font-size:.88rem; }
    .nav > a.active, .nav > a:hover { color:#1ec8b2; }
    .mega { position:relative; }
    .mega-btn { background:transparent; border:1px solid rgba(255,255,255,.18); color:#fff; border-radius:999px; padding:.35rem .85rem; font-weight:650; cursor:pointer; font:inherit; }
    .mega-btn.open, .mega-btn:hover { border-color:#1ec8b2; color:#1ec8b2; }
    .mega-panel { position:absolute; top:calc(100% + .55rem); left:0; width:640px; display:grid; grid-template-columns:1fr 1fr; gap:.35rem; background:#0b1726; border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:.75rem; box-shadow:0 24px 60px rgba(0,0,0,.45); }
    .mega-panel a { display:flex; gap:.7rem; align-items:flex-start; padding:.65rem .7rem; border-radius:12px; color:#fff; }
    .mega-panel a:hover { background:rgba(30,200,178,.12); }
    .mega-panel i { color:#1ec8b2; margin-top:.15rem; }
    .mega-panel b { display:block; font-size:.86rem; }
    .mega-panel span { display:block; font-size:.72rem; opacity:.65; }
    .auth { display:flex; align-items:center; gap:.55rem; }
    .uname { color:rgba(255,255,255,.85); font-size:.85rem; font-weight:600; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .main { min-height: calc(100vh - 180px); padding: 0 0 2.5rem; }
    .footer { background:#07111d; color:rgba(255,255,255,.7); padding:2rem 0 1.4rem; margin-top:1rem; }
    .foot-grid { display:grid; grid-template-columns:1.4fr 1fr auto; gap:1.25rem; align-items:start; }
    .footer strong { color:#fff; display:block; margin-bottom:.35rem; }
    .footer p { margin:0; font-size:.88rem; max-width:420px; line-height:1.5; }
    .links { display:flex; flex-wrap:wrap; gap:.85rem; }
    .links a { color:rgba(255,255,255,.75); font-size:.88rem; }
    .links a:hover { color:#1ec8b2; }
    .meta { font-size:.78rem; opacity:.65; }
    @media (max-width: 1100px) {
      .topbar-inner { flex-wrap:wrap; padding: .85rem 0; }
      .mega-panel { width: min(92vw, 420px); grid-template-columns:1fr; }
      .foot-grid { grid-template-columns:1fr; }
      .uname { display:none; }
    }
  `]
})
export class AppComponent {
  solutionsOpen = false;
  constructor(public auth: AuthService) {}

  @HostListener('document:keydown.escape')
  onEsc() { this.solutionsOpen = false; }

  roleLabel() {
    const r = this.auth.role();
    if (r === 'ADMIN') return 'ADMIN';
    if (r === 'ANALYST') return 'ANALYST';
    if (r === 'CUSTOMER') return 'TRAVELER';
    return r || 'USER';
  }

  roleSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (this.auth.isAdmin()) return 'warn';
    if (this.auth.isAnalyst()) return 'info';
    return 'success';
  }
}
