import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService, Stay } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-stays',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule, ButtonModule, SelectModule, ToastModule, RouterLink],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>
    <section class="page-hero">
      <div class="container-wide">
        <p-tag value="Hospitality Distribution" severity="warn"></p-tag>
        <h1 class="page-title light">Luxury hotels &amp; destination stays</h1>
        <p class="page-sub light">Enterprise hospitality inventory with flight-to-stay cross-sell, tier benefits, and confirmed reservations.</p>
      </div>
    </section>
    <div class="container-wide page-body page-stack">
      <div class="filters card">
        <div class="field">
          <label>Hub airport</label>
          <p-select [options]="hubs" [(ngModel)]="hub" placeholder="All hubs" [showClear]="true" (onChange)="load()" styleClass="w"></p-select>
        </div>
        <div class="field">
          <label>Tier</label>
          <p-select [options]="tiers" [(ngModel)]="tier" placeholder="All tiers" [showClear]="true" (onChange)="load()" styleClass="w"></p-select>
        </div>
        <p-button label="Refresh" icon="pi pi-refresh" [outlined]="true" (onClick)="load()"></p-button>
      </div>
      <div class="grid">
        @for (s of stays; track s.id) {
          <article class="stay">
            <div class="media">
              <p-tag [value]="s.tier.replace('_',' ')" severity="contrast"></p-tag>
              <span class="hub">{{ s.hubAirport }} hub · {{ s.stars }}★</span>
            </div>
            <div class="content">
              <h3>{{ s.name }}</h3>
              <p class="loc">{{ s.city }}, {{ s.country }}</p>
              <p>{{ s.blurb }}</p>
              <div class="am">
                @for (a of s.amenities; track a) { <span>{{ a }}</span> }
              </div>
              <div class="foot">
                <strong>from ₹{{ s.priceFrom | number }}</strong>
                <p-button label="Reserve" size="small" icon="pi pi-check" [loading]="bookingId === s.id" (onClick)="reserve(s)"></p-button>
              </div>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-hero { background:linear-gradient(120deg,#1a1208,#3a2a12 40%,#0d2a28); }
    .light { color:#fff; }
    .filters { display:flex; gap: var(--section-gap); align-items:end; flex-wrap:wrap; margin-bottom: var(--section-gap); }
    .field label { display:block; font-size:.75rem; font-weight:650; margin-bottom:.3rem; color:#667; }
    .w { min-width:180px; }
    .grid { display:grid; grid-template-columns:repeat(4,1fr); gap: var(--section-gap); }
    .stay { background:#fff; border:1px solid var(--gray-300); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 12px 30px rgba(6,16,28,.05); transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out); }
    .stay:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(6,16,28,.08); }
    .media { min-height:110px; padding:1rem; display:flex; justify-content:space-between; align-items:flex-start;
      background: linear-gradient(135deg, #2a1d0c, #0f3a36); color:#fff; }
    .hub { font-size:.75rem; opacity:.85; font-weight:650; text-align:right; }
    .content { padding:1rem 1.1rem 1.15rem; display:grid; gap:.45rem; flex:1; }
    .content h3 { margin:0; color:var(--navy); font-size:1.05rem; }
    .loc { margin:0; color:#7a8796; font-size:.82rem; }
    .content p { margin:0; color:#445; font-size:.88rem; line-height:1.45; }
    .am { display:flex; flex-wrap:wrap; gap:.35rem; }
    .am span { background:var(--gray-100); border-radius:999px; padding:.15rem .5rem; font-size:.7rem; font-weight:650; }
    .foot { display:flex; justify-content:space-between; align-items:center; margin-top:.35rem; gap:.5rem; }
    .foot strong { color:var(--navy); }
    @media (max-width:1200px) { .grid { grid-template-columns:repeat(2,1fr); } }
    @media (max-width:700px) { .grid { grid-template-columns:1fr; } .filters { flex-direction:column; align-items:stretch; } .w { min-width:0; width:100%; } }
  `]
})
export class StaysComponent implements OnInit {
  stays: Stay[] = [];
  hub: string | null = null;
  tier: string | null = null;
  bookingId: string | null = null;
  hubs = ['DXB', 'SIN', 'BOM', 'LHR', 'CDG', 'BKK', 'SYD', 'MLE'].map(v => ({ label: v, value: v }));
  tiers = ['PREMIUM', 'LUXURY', 'ULTRA_LUXURY'].map(v => ({ label: v.replace('_', ' '), value: v }));

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private toast: MessageService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getStays(this.hub || undefined, this.tier || undefined).subscribe(s => this.stays = s);
  }

  reserve(stay: Stay) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.bookingId = stay.id;
    this.api.bookStay(stay.id).subscribe({
      next: r => {
        this.toast.add({ severity: 'success', summary: 'Reservation confirmed', detail: `${r.productName} · Ref ${r.reference}` });
        this.bookingId = null;
      },
      error: e => {
        this.toast.add({ severity: 'error', summary: 'Reservation failed', detail: e.error?.message || 'Try again' });
        this.bookingId = null;
      }
    });
  }
}
