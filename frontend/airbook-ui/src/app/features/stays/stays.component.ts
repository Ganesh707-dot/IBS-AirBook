import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ApiService, Stay } from '../../core/services/api.service';

@Component({
  selector: 'app-stays',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule, ButtonModule, SelectModule],
  template: `
    <section class="page-hero">
      <div class="container-wide">
        <p-tag value="iStay · Hospitality" severity="warn"></p-tag>
        <h1 class="page-title" style="color:#fff;margin-top:.6rem">Luxury hotels &amp; destination stays</h1>
        <p class="page-sub" style="color:rgba(255,255,255,.8)">Unified hospitality distribution — soft-connect from flights to suites, spa, and chauffeur packages.</p>
      </div>
    </section>
    <div class="container-wide body">
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
            <div class="media" [attr.data-hub]="s.hubAirport">
              <p-tag [value]="s.tier.replace('_',' ')" severity="contrast"></p-tag>
              <span class="hub">{{ s.hubAirport }} hub</span>
            </div>
            <div class="content">
              <h3>{{ s.name }}</h3>
              <p class="loc">{{ s.city }}, {{ s.country }} · {{ s.stars }}★</p>
              <p>{{ s.blurb }}</p>
              <div class="am">
                @for (a of s.amenities; track a) { <span>{{ a }}</span> }
              </div>
              <div class="foot">
                <strong>from ₹{{ s.priceFrom | number }}</strong>
                <p-button label="Hold suite" size="small"></p-button>
              </div>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-hero { background:linear-gradient(120deg,#1a1208,#3a2a12 40%,#0d2a28); padding:2.4rem 0 2rem; margin-bottom:1.25rem; }
    .body { padding-bottom:2rem; }
    .filters { display:flex; gap:1rem; align-items:end; flex-wrap:wrap; margin-bottom:1.1rem; }
    .field label { display:block; font-size:.75rem; font-weight:650; margin-bottom:.3rem; color:#667; }
    .w { min-width:180px; }
    .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
    .stay { background:#fff; border:1px solid var(--gray-300); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 12px 30px rgba(6,16,28,.05); }
    .media { min-height:120px; padding:1rem; display:flex; justify-content:space-between; align-items:flex-start;
      background: linear-gradient(135deg, #2a1d0c, #0f3a36); color:#fff; }
    .hub { font-size:.75rem; opacity:.8; font-weight:650; }
    .content { padding:1rem 1.1rem 1.15rem; display:grid; gap:.45rem; flex:1; }
    .content h3 { margin:0; color:var(--navy); font-size:1.05rem; }
    .loc { margin:0; color:#7a8796; font-size:.82rem; }
    .content p { margin:0; color:#445; font-size:.88rem; line-height:1.45; }
    .am { display:flex; flex-wrap:wrap; gap:.35rem; }
    .am span { background:var(--gray-100); border-radius:999px; padding:.15rem .5rem; font-size:.7rem; font-weight:650; }
    .foot { display:flex; justify-content:space-between; align-items:center; margin-top:.35rem; }
    .foot strong { color:var(--navy); }
    @media (max-width:1200px) { .grid { grid-template-columns:repeat(2,1fr); } }
    @media (max-width:700px) { .grid { grid-template-columns:1fr; } }
  `]
})
export class StaysComponent implements OnInit {
  stays: Stay[] = [];
  hub: string | null = null;
  tier: string | null = null;
  hubs = ['DXB', 'SIN', 'BOM', 'LHR', 'CDG', 'BKK', 'SYD', 'MLE'].map(v => ({ label: v, value: v }));
  tiers = ['PREMIUM', 'LUXURY', 'ULTRA_LUXURY'].map(v => ({ label: v.replace('_', ' '), value: v }));

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() {
    this.api.getStays(this.hub || undefined, this.tier || undefined).subscribe(s => this.stays = s);
  }
}
