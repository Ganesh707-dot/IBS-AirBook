import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ApiService, Order } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, TableModule],
  template: `
    <div class="container dash">
      <div class="hero">
        <div>
          <p-tag value="CUSTOMER PORTAL" severity="success"></p-tag>
          <h1>Welcome, {{ auth.user()?.fullName || 'Traveler' }}</h1>
          <p>Your trips, payments, and check-in — separated from Admin CMS and Analyst BI.</p>
        </div>
        <div class="actions">
          <a routerLink="/search"><p-button label="Book a flight" icon="pi pi-search"></p-button></a>
          <a routerLink="/checkin"><p-button label="Check in" icon="pi pi-ticket" [outlined]="true"></p-button></a>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi"><span>Total trips</span><strong>{{ orders.length }}</strong></div>
        <div class="kpi"><span>Awaiting payment</span><strong>{{ count('PENDING_PAYMENT') }}</strong></div>
        <div class="kpi"><span>Settled</span><strong>{{ count('SETTLED') }}</strong></div>
        <div class="kpi"><span>Checked in</span><strong>{{ count('CHECKED_IN') }}</strong></div>
      </div>

      <div class="quick">
        <a routerLink="/bookings" class="quick-card">
          <i class="pi pi-briefcase"></i>
          <div><strong>My Trips</strong><span>View & settle bookings</span></div>
        </a>
        <a routerLink="/checkin" class="quick-card">
          <i class="pi pi-id-card"></i>
          <div><strong>Web Check-in</strong><span>Boarding pass delivery</span></div>
        </a>
        <a routerLink="/tracker" class="quick-card">
          <i class="pi pi-map"></i>
          <div><strong>Live Tracker</strong><span>OpenSky ADS-B map</span></div>
        </a>
        <a routerLink="/search" class="quick-card">
          <i class="pi pi-send"></i>
          <div><strong>Find flights</strong><span>Search Offer catalog</span></div>
        </a>
      </div>

      <p-card header="Recent bookings">
        @if (error) { <p class="err">{{ error }}</p> }
        <p-table [value]="recent" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Reference</th>
              <th>Passenger</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-o>
            <tr>
              <td><strong>{{ o.bookingReference }}</strong></td>
              <td>{{ o.passengerName }}</td>
              <td>₹{{ o.totalAmount | number }}</td>
              <td><p-tag [value]="o.status" [severity]="severity(o.status)"></p-tag></td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="4">No trips yet — <a routerLink="/search">search flights</a> to get started.</td></tr>
          </ng-template>
        </p-table>
        <div class="foot">
          <a routerLink="/bookings"><p-button label="Open all trips" [link]="true"></p-button></a>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .dash { display:grid; gap:1.1rem; }
    .hero { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;
      background: linear-gradient(120deg, #0a2a24, #0f4a40 50%, #12324f);
      color:#fff; border-radius:18px; padding:1.4rem 1.5rem; }
    .hero h1 { margin:.45rem 0 .35rem; font-size:1.65rem; }
    .hero p { margin:0; opacity:.78; max-width:480px; }
    .actions { display:flex; gap:.6rem; flex-wrap:wrap; }
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.85rem; }
    .kpi { background:#fff; border:1px solid var(--gray-300); border-radius:14px; padding:1rem; }
    .kpi span { display:block; font-size:.75rem; color:#667; }
    .kpi strong { font-size:1.35rem; color:var(--navy); }
    .quick { display:grid; grid-template-columns:repeat(4,1fr); gap:.85rem; }
    .quick-card { display:flex; gap:.85rem; align-items:center; background:#fff; border:1px solid var(--gray-300);
      border-radius:14px; padding:1rem; color:inherit; transition: border-color .15s, transform .15s; }
    .quick-card:hover { border-color:var(--teal); transform: translateY(-2px); }
    .quick-card i { font-size:1.35rem; color:var(--teal); }
    .quick-card strong { display:block; }
    .quick-card span { font-size:.78rem; color:#667; }
    .err { color:#c62828; }
    .foot { margin-top:.75rem; }
    @media (max-width:900px) {
      .kpi-row, .quick { grid-template-columns:1fr 1fr; }
      .hero { flex-direction:column; }
    }
    @media (max-width:560px) {
      .kpi-row, .quick { grid-template-columns:1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];
  error = '';

  constructor(private api: ApiService, public auth: AuthService) {}

  get recent() { return this.orders.slice(0, 5); }

  ngOnInit() {
    this.api.getOrders().subscribe({
      next: o => this.orders = o,
      error: () => this.error = 'Failed to load trips'
    });
  }

  count(status: string) {
    return this.orders.filter(o => o.status === status).length;
  }

  severity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (status === 'CHECKED_IN') return 'success';
    if (status === 'SETTLED') return 'info';
    if (status === 'PENDING_PAYMENT') return 'warn';
    if (status === 'CANCELLED') return 'danger';
    return 'secondary';
  }
}
