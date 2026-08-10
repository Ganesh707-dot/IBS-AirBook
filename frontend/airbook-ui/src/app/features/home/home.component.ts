import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ApiService, Airport, Solution } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, DatePickerModule, TagModule, RouterLink],
  template: `
    <section class="premium-hero">
      <div class="container-wide hero-grid">
        <div class="copy">
          <p-tag value="Unified travel commerce" severity="success"></p-tag>
          <h1>Enterprise platform for airlines &amp; hospitality</h1>
          <p class="lead">AirBook orchestrates passenger retail, luxury stays, cruise packages, cargo intelligence, loyalty, and AI-assisted travel — with role-based workspaces for operations, analytics, and travelers.</p>
          <div class="cta">
            <p-button label="Search flights" icon="pi pi-search" (onClick)="goSearch()"></p-button>
            <p-button label="AI Concierge" icon="pi pi-sparkles" severity="secondary" [outlined]="true" (onClick)="go('/concierge')"></p-button>
            <p-button label="Luxury stays" icon="pi pi-building" [outlined]="true" (onClick)="go('/stays')"></p-button>
          </div>
          <div class="trust">
            <span>OpenSky live ADS-B</span><span>Frankfurter FX</span><span>Open-Meteo weather</span><span>JWT RBAC</span><span>OOSD retail</span>
          </div>
        </div>
        <div class="panel">
          <h3>Start a journey</h3>
          <div class="field"><label>From</label>
            <p-select [options]="airportOptions" [(ngModel)]="origin" optionLabel="label" optionValue="value" [filter]="true" styleClass="w-full"></p-select>
          </div>
          <div class="field"><label>To</label>
            <p-select [options]="airportOptions" [(ngModel)]="destination" optionLabel="label" optionValue="value" [filter]="true" styleClass="w-full"></p-select>
          </div>
          <div class="field"><label>Date</label>
            <p-datepicker [(ngModel)]="travelDateObj" dateFormat="yy-mm-dd" [minDate]="minDate" styleClass="w-full" inputStyleClass="w-full"></p-datepicker>
          </div>
          <p-button label="Find offers" icon="pi pi-arrow-right" iconPos="right" styleClass="w-full" (onClick)="goSearch()"></p-button>
          <p class="hint">Or explore <a routerLink="/cruise">cruises</a> · <a routerLink="/stays">hotels</a> · <a routerLink="/loyalty">loyalty</a></p>
        </div>
      </div>
    </section>

    <section class="container-wide section">
      <div class="sec-head">
        <h2>Enterprise solution suite</h2>
        <p>End-to-end travel domains — passenger services through hospitality, cargo, and AI orchestration.</p>
      </div>
      <div class="sol-grid">
        @for (s of solutions; track s.code) {
          <a class="sol" [routerLink]="s.route">
            <div class="sol-top">
              <i class="pi" [ngClass]="s.icon"></i>
              <p-tag [value]="s.domain" severity="secondary"></p-tag>
            </div>
            <h3>{{ s.name }}</h3>
            <p>{{ s.blurb }}</p>
            <div class="pillars">
              @for (p of s.pillars; track p) { <span>{{ p }}</span> }
            </div>
          </a>
        }
      </div>
    </section>

    <section class="band">
      <div class="container-wide band-grid">
        <div>
          <h2>Agentic travel intelligence</h2>
          <p>AI orchestrates personalization, disruption recovery, and cross-domain upsell across flights, hotels, and cruise — optimizing revenue and guest experience.</p>
        </div>
        <div class="band-actions">
          @if (auth.canAccessBi()) {
            <p-button label="Open Analyst BI" icon="pi pi-chart-bar" (onClick)="go('/bi')"></p-button>
          } @else {
            <p-button label="Talk to Concierge" icon="pi pi-comments" (onClick)="go('/concierge')"></p-button>
          }
          <p-button label="Sign in by role" [outlined]="true" (onClick)="go('/login')"></p-button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-grid { display:grid; grid-template-columns: 1.35fr .9fr; gap: clamp(1.25rem, 3vw, 2rem); align-items:center; padding-block: clamp(2rem, 5vw, 3.5rem) clamp(2rem, 4vw, 4rem); }
    .copy h1 { font-size: clamp(2.3rem, 4.5vw, 3.6rem); line-height:1.08; margin:1rem 0 .75rem; letter-spacing:-0.03em; max-width:14ch; }
    .lead { opacity:.9; max-width:620px; font-size:1.08rem; line-height:1.55; margin-bottom:1.25rem; }
    .cta { display:flex; gap:.7rem; flex-wrap:wrap; margin-bottom:1.4rem; }
    .trust { display:flex; flex-wrap:wrap; gap:.55rem; }
    .trust span { border:1px solid rgba(255,255,255,.2); border-radius:999px; padding:.25rem .7rem; font-size:.72rem; font-weight:700; letter-spacing:.04em; opacity:.85; }
    .panel { background:rgba(255,255,255,.96); color:#122033; border-radius:20px; padding:1.25rem 1.3rem; box-shadow:0 24px 60px rgba(0,0,0,.28); }
    .panel h3 { margin:0 0 1rem; color:#06101c; }
    .field { margin-bottom:.85rem; }
    .field label { display:block; font-size:.78rem; font-weight:650; margin-bottom:.3rem; }
    .hint { margin:.9rem 0 0; font-size:.82rem; color:#667; }
    .w-full { width:100%; }
    .section { padding-block: clamp(1.75rem, 4vw, 2.75rem) clamp(0.75rem, 2vw, 1rem); }
    .sec-head { margin-bottom: var(--section-gap); max-width:720px; }
    .sec-head h2 { margin:0 0 .35rem; font-size:1.7rem; color:var(--navy); letter-spacing:-0.02em; }
    .sec-head p { margin:0; color:#5b6b7c; }
    .sol { display:flex; flex-direction:column; gap:.55rem; background:#fff; border:1px solid var(--gray-300); border-radius:18px; padding:1.15rem 1.2rem; color:inherit; transition: transform var(--duration-normal) var(--ease-out), border-color var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out); min-height:210px; }
    .sol:hover { transform:translateY(-3px); border-color:#1ec8b2; box-shadow:0 18px 40px rgba(6,16,28,.08); }
    .sol-top { display:flex; justify-content:space-between; align-items:center; }
    .sol-top i { font-size:1.35rem; color:var(--teal-dark); }
    .sol h3 { margin:0; font-size:1.05rem; color:var(--navy); }
    .sol p { margin:0; color:#5b6b7c; font-size:.88rem; line-height:1.45; flex:1; }
    .pillars { display:flex; flex-wrap:wrap; gap:.35rem; }
    .pillars span { background:var(--gray-100); border-radius:999px; padding:.18rem .55rem; font-size:.7rem; font-weight:650; color:#445; }
    .band { margin-top: clamp(1.25rem, 3vw, 2rem); background:linear-gradient(100deg,#06101c,#0d2a3a 50%,#0a3d36); color:#fff; padding-block: clamp(1.75rem, 4vw, 2.4rem); }
    .band-grid { display:flex; justify-content:space-between; gap: clamp(1rem, 2.5vw, 1.5rem); align-items:center; flex-wrap:wrap; }
    .band h2 { margin:0 0 .45rem; font-size:1.7rem; }
    .band p { margin:0; max-width:640px; opacity:.85; line-height:1.5; }
    .band-actions { display:flex; gap:.65rem; flex-wrap:wrap; }
    @media (max-width:980px) {
      .hero-grid { grid-template-columns:1fr; padding-top: clamp(1.5rem, 4vw, 2.4rem); padding-bottom: clamp(1.75rem, 4vw, 2.5rem); }
      .copy h1 { max-width:none; }
    }
    @media (max-width:640px) {
      .hero-grid { gap: var(--section-gap); }
      .cta { flex-direction:column; align-items:stretch; }
      .panel { border-radius:16px; }
      .band-actions { width:100%; }
    }
  `]
})
export class HomeComponent implements OnInit {
  origin = 'COK'; destination = 'DXB';
  travelDateObj = new Date();
  minDate = new Date();
  airportOptions: { label: string; value: string }[] = [];
  solutions: Solution[] = [];

  constructor(private api: ApiService, private router: Router, public auth: AuthService) {
    const d = new Date(); d.setDate(d.getDate() + 7); this.travelDateObj = d;
  }

  ngOnInit() {
    this.api.getAirports().subscribe(a => {
      this.airportOptions = a.map((x: Airport) => ({ label: `${x.iata} — ${x.city}`, value: x.iata }));
    });
    this.api.getSolutions().subscribe(s => this.solutions = s);
  }

  private dateStr() {
    const d = this.travelDateObj;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  goSearch() {
    this.router.navigate(['/search'], {
      queryParams: { origin: this.origin, destination: this.destination, date: this.dateStr() }
    });
  }

  go(path: string) { this.router.navigate([path]); }
}
