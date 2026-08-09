import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ApiService, LoyaltyPartner, LoyaltyTier } from '../../core/services/api.service';

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [CommonModule, TagModule, CardModule],
  template: `
    <section class="page-hero">
      <div class="container-wide">
        <p-tag value="Loyalty Platform" severity="warn"></p-tag>
        <h1 class="page-title" style="color:#fff;margin-top:.6rem">{{ program || 'AirBook Rewards' }}</h1>
        <p class="page-sub" style="color:rgba(255,255,255,.8)">Configurable tiers and partner offers that accelerate member engagement across air, hotel, and cruise.</p>
      </div>
    </section>
    <div class="container-wide body">
      <div class="tiers">
        @for (t of tiers; track t.code) {
          <article class="tier card" [class.diamond]="t.code==='DIAMOND'">
            <p-tag [value]="t.code" [severity]="t.code==='DIAMOND' ? 'warn' : 'secondary'"></p-tag>
            <h3>{{ t.name }}</h3>
            <p class="th">from {{ t.pointsThreshold | number }} pts · {{ t.earnMultiplier }}x earn</p>
            <p>{{ t.perk }}</p>
          </article>
        }
      </div>
      <h2 class="page-title" style="font-size:1.35rem;margin-top:1.5rem">Partner offers</h2>
      <div class="partners">
        @for (p of partners; track p.name) {
          <div class="partner card">
            <strong>{{ p.name }}</strong>
            <p-tag [value]="p.category" severity="info"></p-tag>
            <p>{{ p.offer }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-hero { background:linear-gradient(120deg,#1a1408,#3d2e14 40%,#0f2a33); padding:2.4rem 0 2rem; margin-bottom:1.25rem; }
    .body { padding-bottom:2rem; }
    .tiers { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
    .tier h3 { margin:.5rem 0 .25rem; color:var(--navy); }
    .th { color:#7a8796; font-size:.85rem; margin:0 0 .45rem; }
    .tier.diamond { border-color:#c4a35a; box-shadow:0 12px 36px rgba(196,163,90,.18); }
    .partners { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
    .partner { display:grid; gap:.45rem; }
    .partner p { margin:0; color:#445; font-size:.9rem; }
    @media (max-width:1000px) { .tiers, .partners { grid-template-columns:1fr 1fr; } }
    @media (max-width:600px) { .tiers, .partners { grid-template-columns:1fr; } }
  `]
})
export class LoyaltyComponent implements OnInit {
  program = '';
  tiers: LoyaltyTier[] = [];
  partners: LoyaltyPartner[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.getLoyalty().subscribe(l => {
      this.program = l.program;
      this.tiers = l.tiers;
      this.partners = l.partners;
    });
  }
}
