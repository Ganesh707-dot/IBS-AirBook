import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ApiService, Offer } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule, TagModule, CardModule,
    MessageModule, IconFieldModule, InputIconModule
  ],
  template: `
    <div class="container page-shell page-stack admin-page">
      <div class="hero">
        <div>
          <p-tag value="ADMIN WORKSPACE" severity="warn"></p-tag>
          <h1>Retail Ops CMS</h1>
          <p>Manage published route inventory, fare families, and seat capacity for the Offer plane.</p>
        </div>
        <div class="hero-meta">
          <span>{{ auth.user()?.fullName }}</span>
          <small>{{ auth.user()?.email }}</small>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi"><span>Published routes</span><strong>{{ routes.length }}</strong></div>
        <div class="kpi"><span>Open seats</span><strong>{{ totalSeats | number }}</strong></div>
        <div class="kpi"><span>Avg base fare</span><strong>₹{{ avgPrice | number:'1.0-0' }}</strong></div>
        <div class="kpi"><span>Markets</span><strong>{{ markets }}</strong></div>
      </div>

      <div class="toolbar card">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search" />
          <input pInputText [(ngModel)]="filter" placeholder="Filter flight / OD…" (input)="applyFilter()" />
        </p-iconfield>
        <div class="toolbar-actions">
          <p-button label="Refresh" icon="pi pi-refresh" [outlined]="true" (onClick)="load()"></p-button>
          <p-button label="Add route" icon="pi pi-plus" (onClick)="showDialog = true"></p-button>
        </div>
      </div>

      @if (msg) {
        <p-message [severity]="msgOk ? 'success' : 'error'" [text]="msg" styleClass="w-full mb"></p-message>
      }

      <p-card styleClass="table-card">
        <div class="table-responsive desktop-table">
          <p-table
            [value]="filtered"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10,25,50]"
            [loading]="loading"
            styleClass="p-datatable-sm"
          >
          <ng-template pTemplate="header">
            <tr>
              <th>Flight</th>
              <th>Route</th>
              <th>Date</th>
              <th>Schedule</th>
              <th>Cabin</th>
              <th>Price</th>
              <th>Seats</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td><strong>{{ r.flightNumber }}</strong><div class="muted">{{ r.airline }}</div></td>
              <td><span class="od">{{ r.origin }} → {{ r.destination }}</span></td>
              <td>{{ r.travelDate }}</td>
              <td>{{ r.departureTime }} – {{ r.arrivalTime }}</td>
              <td><p-tag [value]="r.fareFamily" [severity]="cabinSeverity(r.fareFamily)"></p-tag></td>
              <td>₹{{ r.basePrice | number }}</td>
              <td>{{ r.availableSeats }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="7">No routes found. Add inventory to seed the Offer plane.</td></tr>
          </ng-template>
        </p-table>
        </div>

        <div class="mobile-routes stagger">
          @for (r of filtered; track r.id) {
            <article class="route-card card">
              <div class="route-top">
                <strong>{{ r.flightNumber }}</strong>
                <p-tag [value]="r.fareFamily" [severity]="cabinSeverity(r.fareFamily)"></p-tag>
              </div>
              <div class="od">{{ r.origin }} → {{ r.destination }}</div>
              <div class="route-meta">
                <span>{{ r.travelDate }}</span>
                <span>{{ r.departureTime }} – {{ r.arrivalTime }}</span>
                <span>₹{{ r.basePrice | number }}</span>
                <span>{{ r.availableSeats }} seats</span>
              </div>
            </article>
          } @empty {
            <p class="empty">No routes found. Add inventory to seed the Offer plane.</p>
          }
        </div>
      </p-card>

      <p-dialog header="Publish route" [(visible)]="showDialog" [modal]="true" [style]="{width:'720px', maxWidth:'95vw'}" [draggable]="false" [breakpoints]="{'640px': '98vw'}">
        <div class="form-grid">
          <div class="field"><label>Origin (IATA)</label><input pInputText [(ngModel)]="form.origin" maxlength="3" class="w-full" /></div>
          <div class="field"><label>Destination (IATA)</label><input pInputText [(ngModel)]="form.destination" maxlength="3" class="w-full" /></div>
          <div class="field"><label>Travel date</label><input pInputText type="date" [(ngModel)]="form.travelDate" class="w-full" /></div>
          <div class="field"><label>Flight number</label><input pInputText [(ngModel)]="form.flightNumber" class="w-full" /></div>
          <div class="field"><label>Departure (HH:MM)</label><input pInputText [(ngModel)]="form.departureTime" placeholder="08:30" class="w-full" /></div>
          <div class="field"><label>Arrival (HH:MM)</label><input pInputText [(ngModel)]="form.arrivalTime" placeholder="11:45" class="w-full" /></div>
          <div class="field"><label>Duration (min)</label><p-inputNumber [(ngModel)]="form.durationMinutes" [min]="30" styleClass="w-full" inputStyleClass="w-full" /></div>
          <div class="field"><label>Base price (INR)</label><p-inputNumber [(ngModel)]="form.basePrice" [min]="1000" mode="currency" currency="INR" locale="en-IN" styleClass="w-full" inputStyleClass="w-full" /></div>
          <div class="field">
            <label>Fare family</label>
            <p-select [options]="fareOptions" [(ngModel)]="form.fareFamily" styleClass="w-full"></p-select>
          </div>
          <div class="field"><label>Available seats</label><p-inputNumber [(ngModel)]="form.availableSeats" [min]="1" styleClass="w-full" inputStyleClass="w-full" /></div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancel" [text]="true" (onClick)="showDialog = false"></p-button>
          <p-button label="Publish route" icon="pi pi-check" [loading]="saving" (onClick)="addRoute()"></p-button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .admin-page { display:grid; gap: var(--section-gap); }
    .hero { display:flex; justify-content:space-between; gap: var(--space-4); align-items:flex-start;
      background: linear-gradient(120deg, #0b1c2f 0%, #143552 55%, #0d3d3a 100%);
      color:#fff; border-radius:18px; padding: clamp(1.15rem, 2.5vw, 1.4rem) clamp(1.15rem, 2.5vw, 1.5rem); }
    .hero h1 { margin:.45rem 0 .35rem; font-size:1.7rem; }
    .hero p { margin:0; opacity:.78; max-width:540px; }
    .hero-meta { text-align:right; display:grid; gap:.15rem; }
    .hero-meta span { font-weight:700; }
    .hero-meta small { opacity:.7; }
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.85rem; }
    .kpi { background:#fff; border:1px solid var(--gray-300); border-radius:14px; padding:1rem 1.1rem; }
    .kpi span { display:block; font-size:.75rem; color:#667; margin-bottom:.25rem; }
    .kpi strong { font-size:1.35rem; color:var(--navy); }
    .toolbar { display:flex; justify-content:space-between; gap:1rem; align-items:center; flex-wrap:wrap; }
    .toolbar-actions { display:flex; gap:.55rem; flex-wrap:wrap; }
    .mb { margin-bottom:.25rem; }
    .w-full { width:100%; }
    .muted { color:#7a8796; font-size:.75rem; }
    .od { font-weight:700; letter-spacing:.02em; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .field label { display:block; font-size:.78rem; font-weight:650; margin-bottom:.35rem; color:#5b6b7c; }
    :host ::ng-deep .table-card { overflow:hidden; }
    .mobile-routes { display:none; gap:.75rem; }
    .route-card { display:grid; gap:.45rem; }
    .route-top { display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
    .route-meta { display:flex; flex-wrap:wrap; gap:.45rem .75rem; font-size:.82rem; color:#445; }
    .empty { color:#667; margin:0; }
    @media (max-width:900px) {
      .kpi-row, .form-grid { grid-template-columns:1fr 1fr; }
      .hero { flex-direction:column; }
      .hero-meta { text-align:left; }
      .toolbar { flex-direction:column; align-items:stretch; }
      .toolbar-actions { justify-content:flex-end; }
    }
    @media (max-width:768px) {
      .desktop-table { display:none; }
      .mobile-routes { display:grid; }
    }
    @media (max-width:600px) {
      .kpi-row, .form-grid { grid-template-columns:1fr; }
    }
  `]
})
export class AdminComponent implements OnInit {
  routes: Offer[] = [];
  filtered: Offer[] = [];
  filter = '';
  loading = false;
  saving = false;
  showDialog = false;
  msg = '';
  msgOk = true;
  fareOptions = ['ECONOMY', 'BUSINESS', 'PREMIUM'];
  form = {
    origin: 'COK', destination: 'DXB', travelDate: '', airline: 'AirBook',
    flightNumber: 'AB101', departureTime: '08:30', arrivalTime: '11:45',
    durationMinutes: 195, basePrice: 24500, fareFamily: 'ECONOMY', availableSeats: 160
  };

  constructor(private api: ApiService, public auth: AuthService) {}

  get totalSeats() { return this.routes.reduce((s, r) => s + (r.availableSeats || 0), 0); }
  get avgPrice() {
    if (!this.routes.length) return 0;
    return this.routes.reduce((s, r) => s + (r.basePrice || 0), 0) / this.routes.length;
  }
  get markets() {
    return new Set(this.routes.map(r => `${r.origin}-${r.destination}`)).size;
  }

  ngOnInit() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    this.form.travelDate = d.toISOString().slice(0, 10);
    this.load();
  }

  cabinSeverity(f: string): 'success' | 'info' | 'warn' | 'secondary' {
    if (f === 'BUSINESS') return 'info';
    if (f === 'PREMIUM') return 'warn';
    return 'success';
  }

  load() {
    this.loading = true;
    this.api.getRoutes().subscribe({
      next: r => { this.routes = r; this.applyFilter(); this.loading = false; },
      error: () => { this.msg = 'Failed to load catalog (ADMIN only)'; this.msgOk = false; this.loading = false; }
    });
  }

  applyFilter() {
    const q = this.filter.trim().toUpperCase();
    this.filtered = !q ? [...this.routes] : this.routes.filter(r =>
      r.flightNumber?.toUpperCase().includes(q) ||
      r.origin?.toUpperCase().includes(q) ||
      r.destination?.toUpperCase().includes(q) ||
      `${r.origin}${r.destination}`.includes(q)
    );
  }

  addRoute() {
    this.saving = true; this.msg = '';
    this.api.createRoute(this.form).subscribe({
      next: () => {
        this.msg = 'Route published to Offer catalog';
        this.msgOk = true;
        this.saving = false;
        this.showDialog = false;
        this.load();
      },
      error: e => {
        this.msg = e.error?.message || 'Failed to publish route';
        this.msgOk = false;
        this.saving = false;
      }
    });
  }
}
