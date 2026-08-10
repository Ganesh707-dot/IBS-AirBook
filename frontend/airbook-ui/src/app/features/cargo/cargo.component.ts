import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ApiService, CargoLane } from '../../core/services/api.service';

@Component({
  selector: 'app-cargo',
  standalone: true,
  imports: [CommonModule, TagModule, TableModule, CardModule],
  template: `
    <section class="page-hero">
      <div class="container-wide">
        <p-tag value="iCargo · Air Cargo" severity="contrast"></p-tag>
        <h1 class="page-title light">Cargo lane intelligence</h1>
        <p class="page-sub light">Capacity signals across perishables, pharma cool-chain, express, and valuables — collaboration across the value chain.</p>
      </div>
    </section>
    <div class="container-wide page-body page-stack">
      <div class="kpis kpi-grid-responsive stagger">
        <div class="kpi card"><span>Active lanes</span><strong>{{ lanes.length }}</strong></div>
        <div class="kpi card"><span>Avg capacity</span><strong>{{ avgCapacity }}%</strong></div>
        <div class="kpi card"><span>Express lanes</span><strong>{{ count('EXPRESS') }}</strong></div>
        <div class="kpi card"><span>Pharma lanes</span><strong>{{ count('PHARMA') }}</strong></div>
      </div>
      <p-card>
        <div class="table-responsive desktop-table">
          <p-table [value]="lanes" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr><th>Lane</th><th>Commodity</th><th>Capacity</th><th>ETD (h)</th><th>Note</th></tr>
            </ng-template>
            <ng-template pTemplate="body" let-l>
              <tr>
                <td><strong>{{ l.lane }}</strong><div class="muted">{{ l.code }}</div></td>
                <td><p-tag [value]="l.commodity"></p-tag></td>
                <td>{{ l.capacityScore }}%</td>
                <td>{{ l.etdHours }}h</td>
                <td>{{ l.note }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <div class="mobile-lanes stagger">
          @for (l of lanes; track l.code) {
            <article class="lane-card card">
              <div class="lane-top">
                <strong>{{ l.lane }}</strong>
                <p-tag [value]="l.commodity"></p-tag>
              </div>
              <div class="lane-meta">
                <span>{{ l.capacityScore }}% capacity</span>
                <span>{{ l.etdHours }}h ETD</span>
              </div>
              <p class="note">{{ l.note }}</p>
            </article>
          }
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .page-hero { background:linear-gradient(120deg,#121212,#243044 50%,#1a3030); }
    .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap: var(--section-gap); margin-bottom: var(--section-gap); }
    .kpi span { display:block; font-size:.75rem; color:#667; }
    .kpi strong { font-size:1.35rem; color:var(--navy); }
    .muted { color:#7a8796; font-size:.75rem; }
    .mobile-lanes { display:none; gap:.75rem; }
    .lane-card { display:grid; gap:.45rem; }
    .lane-top { display:flex; justify-content:space-between; align-items:center; gap:.5rem; flex-wrap:wrap; }
    .lane-meta { display:flex; gap:.75rem; font-size:.82rem; color:#445; flex-wrap:wrap; }
    .note { margin:0; font-size:.88rem; color:#556; line-height:1.45; }
    @media (max-width:900px) { .kpis { grid-template-columns:1fr 1fr; } }
    @media (max-width:768px) {
      .desktop-table { display:none; }
      .mobile-lanes { display:grid; }
    }
    @media (max-width:480px) { .kpis { grid-template-columns:1fr; } }
  `]
})
export class CargoComponent implements OnInit {
  lanes: CargoLane[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getCargoLanes().subscribe(l => this.lanes = l); }
  get avgCapacity() {
    if (!this.lanes.length) return 0;
    return Math.round(this.lanes.reduce((s, l) => s + l.capacityScore, 0) / this.lanes.length);
  }
  count(c: string) { return this.lanes.filter(l => l.commodity === c).length; }
}
