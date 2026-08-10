import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ApiService, Airport, LiveFlight, LiveFlightsResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, SelectModule, TagModule, TableModule, ProgressSpinnerModule, MessageModule],
  template: `
    <div class="container page-shell page-stack">
      <div class="screen-head">
        <div>
          <h1 class="page-title">Live flight tracker</h1>
          <p class="page-sub">
            Free ADS-B feed via OpenSky Network —
            <a href="https://opensky-network.org/api/states/all" target="_blank" rel="noopener">https://opensky-network.org/api/states/all</a>
          </p>
        </div>
        <p-button label="Refresh" icon="pi pi-refresh" (onClick)="load()" [loading]="loading"></p-button>
      </div>

      <p-card styleClass="controls">
        <div class="grid">
          <div class="field">
            <label>Corridor origin</label>
            <p-select [options]="airportOptions" [(ngModel)]="origin" optionLabel="label" optionValue="value" [filter]="true" styleClass="w-full"></p-select>
          </div>
          <div class="field">
            <label>Corridor destination</label>
            <p-select [options]="airportOptions" [(ngModel)]="destination" optionLabel="label" optionValue="value" [filter]="true" styleClass="w-full"></p-select>
          </div>
          <div class="field actions">
            <p-button label="Track corridor" icon="pi pi-map-marker" (onClick)="load()" styleClass="w-full"></p-button>
          </div>
        </div>
        @if (data) {
          <div class="meta">
            <p-tag severity="success" [value]="data.airborne + ' airborne'"></p-tag>
            <p-tag severity="info" [value]="data.total + ' total'"></p-tag>
            <span>Updated {{ data.fetchedAt | date:'mediumTime' }}</span>
            <a [href]="data.apiUrl" target="_blank" rel="noopener">{{ data.apiUrl }}</a>
          </div>
        }
      </p-card>

      @if (data && data.total === 0) {
          <p-message severity="warn" styleClass="w-full mt"
            text="OpenSky free API is rate-limiting right now (https://opensky-network.org/api/states/all). Wait ~1 min and hit Refresh — no API key required.">
          </p-message>
        }

      <div class="layout">
        <p-card header="Live map" styleClass="map-card">
          @if (loading && !data) {
            <div class="center"><p-progressSpinner strokeWidth="3"></p-progressSpinner></div>
          }
          <div #mapHost class="map-host"></div>
        </p-card>
        <p-card header="Aircraft list" styleClass="list-card">
          <div class="table-responsive desktop-table">
            <p-table [value]="flights" [paginator]="true" [rows]="8" styleClass="p-datatable-sm" [rowHover]="true" selectionMode="single" [(selection)]="selected" (onRowSelect)="onRowSelect($event)">
              <ng-template pTemplate="header">
                <tr><th>Callsign</th><th>Country</th><th>Alt (m)</th><th>Speed</th><th></th></tr>
              </ng-template>
              <ng-template pTemplate="body" let-f>
                <tr [pSelectableRow]="f">
                  <td><strong>{{ f.callsign }}</strong></td>
                  <td>{{ f.originCountry }}</td>
                  <td>{{ f.altitude != null ? (f.altitude | number:'1.0-0') : '—' }}</td>
                  <td>{{ f.velocity != null ? (f.velocity | number:'1.0-0') + ' m/s' : '—' }}</td>
                  <td><p-tag [severity]="f.onGround ? 'warn' : 'success'" [value]="f.onGround ? 'GND' : 'AIR'"></p-tag></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="5">No live traffic in this corridor right now. Try refresh or another OD.</td></tr>
              </ng-template>
            </p-table>
          </div>
          <div class="mobile-flights">
            @for (f of flights; track f.callsign) {
              <button type="button" class="flight-card card" (click)="focusFlight(f)">
                <div class="fc-top">
                  <strong>{{ f.callsign }}</strong>
                  <p-tag [severity]="f.onGround ? 'warn' : 'success'" [value]="f.onGround ? 'GND' : 'AIR'"></p-tag>
                </div>
                <div class="fc-meta">
                  <span>{{ f.originCountry }}</span>
                  <span>{{ f.altitude != null ? (f.altitude | number:'1.0-0') + ' m' : '—' }}</span>
                  <span>{{ f.velocity != null ? (f.velocity | number:'1.0-0') + ' m/s' : '—' }}</span>
                </div>
              </button>
            } @empty {
              <p class="empty">No live traffic in this corridor right now.</p>
            }
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:1.2fr 1.2fr auto; gap:1rem; align-items:end; }
    .field label { display:block; font-size:.8rem; font-weight:600; margin-bottom:.35rem; }
    .meta { display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; margin-top:1rem; font-size:.9rem; }
    .meta a { word-break: break-all; }
    .layout { display:grid; grid-template-columns: 1.4fr 1fr; gap: var(--section-gap); margin-top: var(--section-gap); }
    .map-host { height: 520px; width: 100%; border-radius: 12px; overflow:hidden; background:#d9e6f2; transition: height var(--duration-normal) var(--ease-out); }
    .center { display:flex; justify-content:center; padding:1rem; }
    .mt { margin-top:1rem; display:block; }
    .w-full { width:100%; }
    .mobile-flights { display:none; gap:.65rem; max-height:420px; overflow-y:auto; -webkit-overflow-scrolling:touch; }
    .flight-card { width:100%; text-align:left; display:grid; gap:.4rem; cursor:pointer; border:none; font:inherit; transition: border-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
    .flight-card:hover { border-color:var(--teal); transform: translateY(-1px); }
    .fc-top { display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
    .fc-meta { display:flex; flex-wrap:wrap; gap:.5rem .75rem; font-size:.82rem; color:#445; }
    .empty { color:#667; font-size:.9rem; margin:0; }
    @media (max-width: 960px) {
      .grid, .layout { grid-template-columns:1fr; }
      .map-host { height: 320px; }
    }
    @media (max-width: 768px) {
      .desktop-table { display:none; }
      .mobile-flights { display:grid; }
      .map-host { height: 280px; }
    }
  `]
})
export class TrackerComponent implements OnInit, OnDestroy {
  @ViewChild('mapHost', { static: true }) mapHost!: ElementRef<HTMLDivElement>;

  origin = 'COK';
  destination = 'DXB';
  airportOptions: { label: string; value: string }[] = [];
  loading = false;
  error = '';
  data: LiveFlightsResponse | null = null;
  flights: LiveFlight[] = [];
  selected: LiveFlight | null = null;

  private map?: L.Map;
  private layer = L.layerGroup();
  private timer?: ReturnType<typeof setInterval>;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.api.getAirports().subscribe(a => {
      this.airportOptions = a.map(x => ({ label: `${x.iata} — ${x.city}`, value: x.iata }));
    });
    this.route.queryParams.subscribe(p => {
      if (p['origin']) this.origin = p['origin'];
      if (p['destination']) this.destination = p['destination'];
      setTimeout(() => {
        this.initMap();
        this.load();
      });
    });
    this.timer = setInterval(() => this.load(true), 45000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.map?.remove();
  }

  private initMap() {
    if (this.map || !this.mapHost?.nativeElement) return;
    this.map = L.map(this.mapHost.nativeElement, { zoomControl: true }).setView([20, 60], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap · traffic via OpenSky Network',
      maxZoom: 12
    }).addTo(this.map);
    this.layer.addTo(this.map);
  }

  load(silent = false) {
    if (!silent) this.loading = true;
    this.error = '';
    this.api.getLiveFlights(this.origin, this.destination).subscribe({
      next: res => {
        this.data = res;
        this.flights = res.flights || [];
        this.renderMarkers();
        this.loading = false;
      },
      error: e => {
        this.error = e.error?.message || 'Failed to load live flights from OpenSky';
        this.loading = false;
      }
    });
  }

  private renderMarkers() {
    if (!this.map) this.initMap();
    if (!this.map) return;
    this.layer.clearLayers();
    const points: L.LatLngExpression[] = [];
    for (const f of this.flights) {
      if (f.latitude == null || f.longitude == null) continue;
      const latlng: L.LatLngExpression = [f.latitude, f.longitude];
      points.push(latlng);
      const icon = L.divIcon({
        className: 'flight-marker',
        html: `<div style="transform:rotate(${f.heading || 0}deg);font-size:18px;color:${f.onGround ? '#f59e0b' : '#00b4a0'};">✈</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker(latlng, { icon })
        .bindPopup(`<strong>${f.callsign}</strong><br>${f.originCountry}<br>Alt: ${f.altitude != null ? Math.round(f.altitude) + ' m' : 'n/a'}<br>Speed: ${f.velocity != null ? Math.round(f.velocity) + ' m/s' : 'n/a'}`)
        .addTo(this.layer);
    }
    if (points.length) {
      this.map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 7 });
    } else if (this.data?.bbox) {
      const b = this.data.bbox;
      this.map.fitBounds([[b.lamin, b.lomin], [b.lamax, b.lomax]]);
    }
  }

  focusFlight(f: LiveFlight) {
    if (!this.map || f.latitude == null || f.longitude == null) return;
    this.map.setView([f.latitude, f.longitude], 7);
  }

  onRowSelect(event: any) {
    const data = event?.data;
    if (data && !Array.isArray(data)) this.focusFlight(data as LiveFlight);
  }
}
