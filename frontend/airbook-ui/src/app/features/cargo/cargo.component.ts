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
        <h1 class="page-title" style="color:#fff;margin-top:.6rem">Cargo lane intelligence</h1>
        <p class="page-sub" style="color:rgba(255,255,255,.8)">Capacity signals across perishables, pharma cool-chain, express, and valuables — collaboration across the value chain.</p>
      </div>
    </section>
    <div class="container-wide body">
      <div class="kpis">
        <div class="kpi card"><span>Active lanes</span><strong>{{ lanes.length }}</strong></div>
        <div class="kpi card"><span>Avg capacity</span><strong>{{ avgCapacity }}%</strong></div>
        <div class="kpi card"><span>Express lanes</span><strong>{{ count('EXPRESS') }}</strong></div>
        <div class="kpi card"><span>Pharma lanes</span><strong>{{ count('PHARMA') }}</strong></div>
      </div>
      <p-card>
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
      </p-card>
    </div>
  `,
  styles: [`
    .page-hero { background:linear-gradient(120deg,#121212,#243044 50%,#1a3030); padding:2.4rem 0 2rem; margin-bottom:1.25rem; }
    .body { padding-bottom:2rem; }
    .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:.85rem; margin-bottom:1rem; }
    .kpi span { display:block; font-size:.75rem; color:#667; }
    .kpi strong { font-size:1.35rem; color:var(--navy); }
    .muted { color:#7a8796; font-size:.75rem; }
    @media (max-width:900px) { .kpis { grid-template-columns:1fr 1fr; } }
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
