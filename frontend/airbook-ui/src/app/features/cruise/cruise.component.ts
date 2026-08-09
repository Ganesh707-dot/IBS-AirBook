import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService, Cruise } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cruise',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule, ButtonModule, SelectModule, ToastModule, RouterLink],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>
    <section class="page-hero">
      <div class="container-wide">
        <p-tag value="Cruise & Tours" severity="info"></p-tag>
        <h1 class="page-title light">Premium cruise &amp; tour packages</h1>
        <p class="page-sub light">Shore-to-ship retail with confirmed cabin reservations, excursion packs, and loyalty earn.</p>
      </div>
    </section>
    <div class="container-wide body">
      <div class="filters card">
        <div class="field">
          <label>Experience tier</label>
          <p-select [options]="tiers" [(ngModel)]="tier" placeholder="All" [showClear]="true" (onChange)="load()" styleClass="w"></p-select>
        </div>
        <p-button label="Refresh" icon="pi pi-refresh" [outlined]="true" (onClick)="load()"></p-button>
      </div>
      <div class="list">
        @for (c of cruises; track c.id) {
          <article class="cruise card">
            <div class="left">
              <p-tag [value]="c.tier.replace('_',' ')"></p-tag>
              <h3>{{ c.name }}</h3>
              <p class="ship">{{ c.ship }} · {{ c.nights }} nights</p>
              <p>{{ c.blurb }}</p>
              <div class="ports"><b>Embark</b> {{ c.embarkPort }} · <b>Ports</b> {{ c.portsOfCall }}</div>
              <div class="perks">@for (p of c.perks; track p) { <span>{{ p }}</span> }</div>
            </div>
            <div class="right">
              <small>from</small>
              <strong>₹{{ c.priceFrom | number }}</strong>
              <p-button label="Reserve cabin" icon="pi pi-compass" [loading]="bookingId === c.id" (onClick)="reserve(c)"></p-button>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-hero { background:linear-gradient(120deg,#071526,#0f3550 45%,#0a4a55); padding:2.4rem 0 2rem; margin-bottom:1.25rem; }
    .light { color:#fff; }
    .page-sub.light { color:rgba(255,255,255,.82); max-width:680px; }
    .filters { display:flex; gap:1rem; align-items:end; margin-bottom:1rem; }
    .field label { display:block; font-size:.75rem; font-weight:650; margin-bottom:.3rem; color:#667; }
    .w { min-width:200px; }
    .list { display:grid; gap:1rem; }
    .cruise { display:grid; grid-template-columns:1fr 220px; gap:1.25rem; align-items:center; }
    .left h3 { margin:.45rem 0 .2rem; color:var(--navy); font-size:1.25rem; }
    .ship { color:#7a8796; margin:0 0 .45rem; font-size:.88rem; }
    .ports { font-size:.88rem; color:#334; margin:.5rem 0; }
    .perks { display:flex; flex-wrap:wrap; gap:.35rem; }
    .perks span { background:var(--gray-100); border-radius:999px; padding:.18rem .55rem; font-size:.72rem; font-weight:650; }
    .right { text-align:right; display:grid; gap:.35rem; justify-items:end; }
    .right small { color:#667; }
    .right strong { font-size:1.35rem; color:var(--navy); }
    @media (max-width:800px) { .cruise { grid-template-columns:1fr; } .right { justify-items:start; text-align:left; } }
  `]
})
export class CruiseComponent implements OnInit {
  cruises: Cruise[] = [];
  tier: string | null = null;
  bookingId: string | null = null;
  tiers = ['PREMIUM', 'LUXURY', 'ULTRA_LUXURY'].map(v => ({ label: v.replace('_', ' '), value: v }));

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private toast: MessageService
  ) {}

  ngOnInit() { this.load(); }

  load() { this.api.getCruises(this.tier || undefined).subscribe(c => this.cruises = c); }

  reserve(cruise: Cruise) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.bookingId = cruise.id;
    this.api.bookCruise(cruise.id).subscribe({
      next: r => {
        this.toast.add({ severity: 'success', summary: 'Cabin reserved', detail: `${r.productName} · Ref ${r.reference}` });
        this.bookingId = null;
      },
      error: e => {
        this.toast.add({ severity: 'error', summary: 'Reservation failed', detail: e.error?.message || 'Try again' });
        this.bookingId = null;
      }
    });
  }
}
