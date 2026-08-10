import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TagModule, ToastModule],
  template: `
    <p-toast position="top-right"></p-toast>

    @if (!auth.isLoggedIn()) {
      <div class="demo-bar">
        <span class="demo-label">Enterprise demo</span>
        <span class="demo-creds">
          Traveler <code>customer&#64;airbook.com</code> · Analyst <code>analyst&#64;airbook.com</code> · Admin <code>admin&#64;airbook.com</code> · <code>*123</code>
        </span>
        <a routerLink="/login" class="demo-link">Sign in →</a>
      </div>
    }

    <header class="topbar">
      <div class="container-wide topbar-inner">
        <a routerLink="/" class="brand" (click)="closeMenu()">
          <span class="mark">AB</span>
          <div class="brand-text">
            <strong>AirBook Enterprise</strong>
            <small>Unified travel commerce platform</small>
          </div>
        </a>

        <nav class="nav desktop-nav" aria-label="Main navigation">
          <div class="mega" (mouseenter)="solutionsOpen = true" (mouseleave)="solutionsOpen = false">
            <button type="button" class="mega-btn" [class.open]="solutionsOpen" (click)="toggleSolutionsDesktop($event)">Solutions</button>
            @if (solutionsOpen) {
              <div class="mega-panel animate-fade">
                @for (item of solutionLinks; track item.route) {
                  @if (!item.biOnly || auth.canAccessBi()) {
                    <a [routerLink]="item.route" (click)="solutionsOpen=false">
                      <i class="pi" [ngClass]="item.icon"></i>
                      <div><b>{{ item.title }}</b><span>{{ item.sub }}</span></div>
                    </a>
                  }
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
            <a routerLink="/bi" routerLinkActive="active">Intelligence</a>
            <a routerLink="/admin" routerLinkActive="active">Ops CMS</a>
          }
        </nav>

        <div class="auth">
          @if (auth.isLoggedIn()) {
            <p-tag [severity]="roleSeverity()" [value]="roleLabel()"></p-tag>
            <span class="uname">{{ auth.user()?.fullName }}</span>
            <p-button label="Logout" severity="secondary" [outlined]="true" size="small" (onClick)="auth.logout()"></p-button>
          } @else {
            <a routerLink="/login" class="sign-in-link"><p-button label="Sign in" size="small"></p-button></a>
          }

          <button type="button" class="menu-toggle" (click)="toggleMenu()" [attr.aria-expanded]="mobileMenuOpen" aria-label="Toggle navigation menu">
            <span class="bar" [class.open]="mobileMenuOpen"></span>
          </button>
        </div>
      </div>
    </header>

    @if (mobileMenuOpen) {
      <div class="nav-backdrop animate-fade" (click)="closeMenu()" aria-hidden="true"></div>
      <aside class="mobile-drawer" [class.open]="mobileMenuOpen" aria-label="Mobile navigation">
        <div class="drawer-head">
          <strong>Menu</strong>
          <button type="button" class="drawer-close" (click)="closeMenu()" aria-label="Close menu"><i class="pi pi-times"></i></button>
        </div>

        @if (auth.isLoggedIn()) {
          <div class="drawer-user">
            <p-tag [severity]="roleSeverity()" [value]="roleLabel()"></p-tag>
            <span>{{ auth.user()?.fullName }}</span>
          </div>
        }

        <div class="drawer-section">
          <button type="button" class="drawer-accordion" (click)="mobileSolutionsOpen = !mobileSolutionsOpen">
            <span>Solutions</span>
            <i class="pi" [ngClass]="mobileSolutionsOpen ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
          </button>
          @if (mobileSolutionsOpen) {
            <div class="drawer-sub animate-slide-up">
              @for (item of solutionLinks; track item.route) {
                @if (!item.biOnly || auth.canAccessBi()) {
                  <a [routerLink]="item.route" routerLinkActive="active" (click)="closeMenu()">
                    <i class="pi" [ngClass]="item.icon"></i>{{ item.title }}
                  </a>
                }
              }
            </div>
          }
        </div>

        <nav class="drawer-links">
          <a routerLink="/search" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-send"></i> Flights</a>
          <a routerLink="/stays" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-building"></i> Hotels</a>
          <a routerLink="/cruise" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-compass"></i> Cruise</a>
          <a routerLink="/concierge" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-sparkles"></i> AI Concierge</a>
          <a routerLink="/tracker" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-map"></i> Live Tracker</a>
          <a routerLink="/cargo" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-box"></i> Cargo</a>
          <a routerLink="/loyalty" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-star"></i> Loyalty</a>

          @if (auth.isCustomer()) {
            <div class="drawer-divider">Traveler workspace</div>
            <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-home"></i> My Journey</a>
            <a routerLink="/bookings" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-briefcase"></i> Trips</a>
            <a routerLink="/checkin" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-id-card"></i> Check-in</a>
          }
          @if (auth.isAnalyst() && !auth.isAdmin()) {
            <div class="drawer-divider">Analyst workspace</div>
            <a routerLink="/bi" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-chart-line"></i> Analyst BI</a>
          }
          @if (auth.isAdmin()) {
            <div class="drawer-divider">Admin workspace</div>
            <a routerLink="/bi" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-chart-line"></i> Intelligence</a>
            <a routerLink="/admin" routerLinkActive="active" (click)="closeMenu()"><i class="pi pi-cog"></i> Ops CMS</a>
          }
        </nav>

        <div class="drawer-foot">
          @if (auth.isLoggedIn()) {
            <p-button label="Logout" severity="secondary" [outlined]="true" styleClass="w-full" (onClick)="auth.logout(); closeMenu()"></p-button>
          } @else {
            <a routerLink="/login" (click)="closeMenu()"><p-button label="Sign in" styleClass="w-full"></p-button></a>
          }
        </div>
      </aside>
    }

    <main class="main" [class.animate-page]="pageAnimating"><router-outlet /></main>

    <footer class="footer">
      <div class="container-wide foot-grid">
        <div>
          <strong>AirBook Enterprise Platform</strong>
          <p>Passenger retail · Hospitality · Cruise · Cargo · Loyalty · AI concierge · Role-based workspaces.</p>
        </div>
        <div class="links">
          <a routerLink="/stays">Hotels</a>
          <a routerLink="/cruise">Cruise</a>
          <a routerLink="/cargo">Cargo</a>
          <a routerLink="/loyalty">Loyalty</a>
          <a routerLink="/concierge">AI Concierge</a>
        </div>
        <div class="meta">Production API · JWT RBAC · OpenSky · Dynamic pricing</div>
      </div>
    </footer>
  `,
  styles: [`
    .demo-bar {
      background: #102a44;
      color: rgba(255,255,255,.88);
      font-size: .78rem;
      padding: .45rem 1rem;
      display: flex;
      gap: .65rem;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .demo-label { font-weight: 700; color: #1ec8b2; white-space: nowrap; }
    .demo-creds { text-align: center; }
    .demo-bar code { background: rgba(255,255,255,.08); padding: .1rem .35rem; border-radius: 4px; font-size: .72rem; }
    .demo-link { color: #1ec8b2; font-weight: 650; white-space: nowrap; }

    .topbar {
      background: linear-gradient(90deg, #050d18, #0c2238 55%, #0a2e2a);
      color: #fff;
      position: sticky;
      top: 0;
      z-index: 1200;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .topbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 74px;
      padding-block: var(--space-3);
    }
    .brand { display: flex; align-items: center; gap: .75rem; color: #fff; flex-shrink: 0; }
    .mark {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1ec8b2, #c4a35a);
      color: #06101c;
      font-weight: 800;
      font-size: .85rem;
      transition: transform var(--duration-fast) var(--ease-out);
    }
    .brand:hover .mark { transform: scale(1.05); }
    .brand strong { display: block; line-height: 1.1; }
    .brand small { opacity: .65; font-size: .68rem; }

    .nav { display: flex; gap: .85rem; flex-wrap: wrap; align-items: center; }
    .nav > a {
      color: rgba(255,255,255,.78);
      font-weight: 600;
      font-size: .88rem;
      transition: color var(--duration-fast) var(--ease-out);
      white-space: nowrap;
    }
    .nav > a.active, .nav > a:hover { color: #1ec8b2; }

    .mega { position: relative; }
    .mega-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,.18);
      color: #fff;
      border-radius: 999px;
      padding: .35rem .85rem;
      font-weight: 650;
      cursor: pointer;
      font: inherit;
      transition: border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
    }
    .mega-btn.open, .mega-btn:hover { border-color: #1ec8b2; color: #1ec8b2; }
    .mega-panel {
      position: absolute;
      top: calc(100% + .55rem);
      left: 0;
      width: 640px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: .35rem;
      background: #0b1726;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 16px;
      padding: .75rem;
      box-shadow: 0 24px 60px rgba(0,0,0,.45);
      z-index: 1300;
    }
    .mega-panel a {
      display: flex;
      gap: .7rem;
      align-items: flex-start;
      padding: .65rem .7rem;
      border-radius: 12px;
      color: #fff;
      transition: background var(--duration-fast) var(--ease-out);
    }
    .mega-panel a:hover { background: rgba(30,200,178,.12); }
    .mega-panel i { color: #1ec8b2; margin-top: .15rem; }
    .mega-panel b { display: block; font-size: .86rem; }
    .mega-panel span { display: block; font-size: .72rem; opacity: .65; }

    .auth { display: flex; align-items: center; gap: .55rem; flex-shrink: 0; }
    .uname {
      color: rgba(255,255,255,.85);
      font-size: .85rem;
      font-weight: 600;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-toggle {
      display: none;
      width: 44px;
      height: 44px;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 12px;
      background: rgba(255,255,255,.06);
      cursor: pointer;
      padding: 0;
      align-items: center;
      justify-content: center;
      transition: background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out);
    }
    .menu-toggle:hover { background: rgba(30,200,178,.15); border-color: #1ec8b2; }
    .bar {
      display: block;
      width: 20px;
      height: 2px;
      background: #fff;
      position: relative;
      margin: 0 auto;
      transition: background var(--duration-fast) var(--ease-out);
    }
    .bar::before, .bar::after {
      content: '';
      position: absolute;
      left: 0;
      width: 20px;
      height: 2px;
      background: #fff;
      transition: transform var(--duration-normal) var(--ease-out), top var(--duration-normal) var(--ease-out);
    }
    .bar::before { top: -6px; }
    .bar::after { top: 6px; }
    .bar.open { background: transparent; }
    .bar.open::before { top: 0; transform: rotate(45deg); }
    .bar.open::after { top: 0; transform: rotate(-45deg); }

    .nav-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(6,16,28,.55);
      z-index: 1400;
      backdrop-filter: blur(4px);
    }

    .mobile-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: min(320px, 88vw);
      height: 100dvh;
      background: linear-gradient(180deg, #0b1726 0%, #06101c 100%);
      color: #fff;
      z-index: 1500;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform var(--duration-normal) var(--ease-out);
      box-shadow: -12px 0 40px rgba(0,0,0,.35);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .mobile-drawer.open { transform: translateX(0); }

    .drawer-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .drawer-close {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 10px;
      background: rgba(255,255,255,.08);
      color: #fff;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: background var(--duration-fast) var(--ease-out);
    }
    .drawer-close:hover { background: rgba(30,200,178,.2); }

    .drawer-user {
      display: flex;
      align-items: center;
      gap: .55rem;
      padding: .85rem 1.1rem;
      border-bottom: 1px solid rgba(255,255,255,.06);
      font-size: .88rem;
      font-weight: 600;
    }

    .drawer-section { padding: .5rem 1.1rem 0; }
    .drawer-accordion {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .75rem 0;
      background: none;
      border: none;
      color: #fff;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }
    .drawer-sub {
      display: grid;
      gap: .15rem;
      padding-bottom: .5rem;
    }
    .drawer-sub a {
      display: flex;
      align-items: center;
      gap: .55rem;
      padding: .55rem .65rem;
      border-radius: 10px;
      color: rgba(255,255,255,.82);
      font-size: .88rem;
      transition: background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
    }
    .drawer-sub a:hover, .drawer-sub a.active { background: rgba(30,200,178,.12); color: #1ec8b2; }
    .drawer-sub i { color: #1ec8b2; font-size: .85rem; }

    .drawer-links {
      display: flex;
      flex-direction: column;
      padding: .5rem 1.1rem;
      gap: .15rem;
      flex: 1;
    }
    .drawer-links a {
      display: flex;
      align-items: center;
      gap: .65rem;
      padding: .7rem .65rem;
      border-radius: 10px;
      color: rgba(255,255,255,.85);
      font-weight: 600;
      font-size: .9rem;
      transition: background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
    }
    .drawer-links a i { color: #1ec8b2; width: 1.1rem; }
    .drawer-links a:hover, .drawer-links a.active { background: rgba(30,200,178,.12); color: #1ec8b2; }
    .drawer-divider {
      margin: .65rem 0 .25rem;
      padding: 0 .65rem;
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: rgba(255,255,255,.45);
    }

    .drawer-foot {
      padding: 1rem 1.1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    .w-full { width: 100%; }

    .main {
      min-height: calc(100vh - 180px);
      padding-block: var(--space-4) clamp(1.5rem, 3vw, 2.5rem);
    }

    .footer {
      background: #07111d;
      color: rgba(255,255,255,.7);
      padding-block: clamp(1.5rem, 3vw, 2rem) clamp(1rem, 2vw, 1.4rem);
      margin-top: 0;
    }
    .foot-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr auto;
      gap: clamp(1rem, 2vw, 1.25rem);
      align-items: start;
    }
    .footer strong { color: #fff; display: block; margin-bottom: .35rem; }
    .footer p { margin: 0; font-size: .88rem; max-width: 420px; line-height: 1.5; }
    .links { display: flex; flex-wrap: wrap; gap: .85rem; }
    .links a { color: rgba(255,255,255,.75); font-size: .88rem; transition: color var(--duration-fast) var(--ease-out); }
    .links a:hover { color: #1ec8b2; }
    .meta { font-size: .78rem; opacity: .65; }

    @media (max-width: 992px) {
      .desktop-nav { display: none; }
      .menu-toggle { display: inline-flex; }
      .uname { display: none; }
      .sign-in-link { display: none; }
      .brand-text small { display: none; }
      .foot-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .demo-creds { display: none; }
      .demo-bar { justify-content: space-between; padding: .4rem .85rem; }
      .topbar-inner { min-height: 64px; }
      .brand strong { font-size: .92rem; }
      .mark { width: 38px; height: 38px; }
    }

    @media (min-width: 993px) {
      .mobile-drawer, .nav-backdrop { display: none !important; }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  solutionsOpen = false;
  mobileMenuOpen = false;
  mobileSolutionsOpen = false;
  pageAnimating = false;
  private navSub?: Subscription;
  private isDesktop = true;

  solutionLinks = [
    { route: '/search', icon: 'pi-send', title: 'Passenger Retail', sub: 'Offer → Order → Deliver', biOnly: false },
    { route: '/stays', icon: 'pi-building', title: 'Hospitality', sub: 'Luxury hotel distribution', biOnly: false },
    { route: '/cruise', icon: 'pi-compass', title: 'Cruise & Tours', sub: 'Shore-to-ship packages', biOnly: false },
    { route: '/cargo', icon: 'pi-box', title: 'Cargo Intelligence', sub: 'Lane capacity & commodities', biOnly: false },
    { route: '/loyalty', icon: 'pi-star', title: 'Loyalty Platform', sub: 'Tiers & partner offers', biOnly: false },
    { route: '/concierge', icon: 'pi-sparkles', title: 'AI Concierge', sub: 'Tourist assistance', biOnly: false },
    { route: '/tracker', icon: 'pi-map', title: 'Operations Center', sub: 'Live network map', biOnly: false },
    { route: '/bi', icon: 'pi-chart-line', title: 'Retail Intelligence', sub: 'Analyst workspace', biOnly: true },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkViewport();
    this.navSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMenu();
      this.triggerPageAnimation();
    });
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
    this.unlockScroll();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkViewport();
    if (this.isDesktop) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.solutionsOpen = false;
    this.closeMenu();
  }

  private checkViewport() {
    this.isDesktop = window.innerWidth > 992;
  }

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  closeMenu() {
    this.mobileMenuOpen = false;
    this.mobileSolutionsOpen = false;
    this.unlockScroll();
  }

  toggleSolutionsDesktop(event: Event) {
    if (!this.isDesktop) return;
    event.stopPropagation();
    this.solutionsOpen = !this.solutionsOpen;
  }

  private lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll() {
    document.body.style.overflow = '';
  }

  private triggerPageAnimation() {
    this.pageAnimating = false;
    requestAnimationFrame(() => {
      this.pageAnimating = true;
    });
  }

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
