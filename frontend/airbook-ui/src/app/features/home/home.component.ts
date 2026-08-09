import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ApiService, Airport } from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, SelectModule, DatePickerModule, TagModule],
  template: `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <p-tag value="Airline Retail Platform" severity="success"></p-tag>
          <h1>AirBook</h1>
          <p class="lead">Offer → Order → Settle → Deliver for modern passenger retail.</p>
          <p>Dynamic pricing, AI BI, and live flight tracking — built for airline retail engineering interviews.</p>
          <div class="cta">
            <p-button label="Search flights" icon="pi pi-search" (onClick)="goSearch()"></p-button>
            <p-button label="Live tracker" icon="pi pi-map" severity="secondary" [outlined]="true" (onClick)="goTracker()"></p-button>
          </div>
        </div>
        <p-card styleClass="search-panel">
          <h3>Start booking</h3>
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
        </p-card>
      </div>
    </section>

    <section class="container tiles">
      <p-card><h3>1. Offer</h3><p>Live demand + FX-aware fares across 40 airports.</p></p-card>
      <p-card><h3>2. Order</h3><p>PrimeNG multi-step booking with ancillaries & payment.</p></p-card>
      <p-card><h3>3. Settle</h3><p>Payment settlement with payment ID & conversion analytics.</p></p-card>
      <p-card><h3>4. Deliver</h3><p>Web check-in and digital boarding pass delivery.</p></p-card>
    </section>
  `,
  styles: [`
    .hero { background: radial-gradient(circle at top right, #123554, #071526 55%); color:#fff; padding: 3.5rem 0 4.5rem; }
    .hero-grid { display:grid; grid-template-columns: 1.3fr 1fr; gap:1.5rem; align-items:center; }
    h1 { font-size: clamp(2.4rem, 5vw, 3.4rem); line-height:1.1; margin:1rem 0 .5rem; letter-spacing:-0.02em; }
    .lead { opacity:.95; max-width:560px; font-size:1.1rem; font-weight:600; margin-bottom:.5rem; }
    p { opacity:.85; max-width:560px; }
    .cta { display:flex; gap:.75rem; margin-top:1.25rem; flex-wrap:wrap; }
    :host ::ng-deep .search-panel { background:#fff; color:#122033; border-radius:16px; }
    .field { margin-bottom: .85rem; }
    .field label { display:block; font-size:.8rem; font-weight:600; margin-bottom:.3rem; }
    .tiles { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-top:-2rem; position:relative; z-index:2; }
    .tiles h3 { margin:0 0 .4rem; color:#071526; }
    .tiles p { margin:0; color:#556; font-size:.92rem; }
    .w-full { width:100%; }
    @media (max-width:900px) {
      .hero-grid, .tiles { grid-template-columns:1fr; }
    }
  `]
})
export class HomeComponent implements OnInit {
  origin = 'COK'; destination = 'DXB';
  travelDateObj = new Date();
  minDate = new Date();
  airportOptions: { label: string; value: string }[] = [];

  constructor(private api: ApiService, private router: Router) {
    const d = new Date(); d.setDate(d.getDate() + 7); this.travelDateObj = d;
  }

  ngOnInit() {
    this.api.getAirports().subscribe(a => {
      this.airportOptions = a.map(x => ({ label: `${x.iata} — ${x.city}`, value: x.iata }));
    });
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

  goTracker() {
    this.router.navigate(['/tracker'], {
      queryParams: { origin: this.origin, destination: this.destination }
    });
  }
}
