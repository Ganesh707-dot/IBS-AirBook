import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ApiService, Order, PlatformReservation } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, TableModule],
  template: `
    <div class="container-wide page-shell page-stack dash">
      <div class="hero">
        <div>
          <p-tag value="TRAVELER WORKSPACE" severity="success"></p-tag>
          <h1>Welcome, {{ auth.user()?.fullName || 'Traveler' }}</h1>
          <p>Your journey hub — flights, luxury stays, cruise, AI concierge, and check-in. Separate from Analyst BI and Ops CMS.</p>
        </div>
        <div class="actions">
          <a routerLink="/search"><p-button label="Book a flight" icon="pi pi-search"></p-button></a>
          <a routerLink="/concierge"><p-button label="AI Concierge" icon="pi pi-sparkles" [outlined]="true"></p-button></a>
        </div>
      </div>

      <div class="kpi-row kpi-grid-responsive stagger">
        <div class="kpi"><span>Total trips</span><strong>{{ orders.length }}</strong></div>
        <div class="kpi"><span>Awaiting payment</span><strong>{{ count('PENDING_PAYMENT') }}</strong></div>
        <div class="kpi"><span>Settled</span><strong>{{ count('SETTLED') }}</strong></div>
        <div class="kpi"><span>Checked in</span><strong>{{ count('CHECKED_IN') }}</strong></div>
      </div>

      <div class="quick stagger">
        <a routerLink="/bookings" class="quick-card">
          <i class="pi pi-briefcase"></i>
          <div><strong>My Trips</strong><span>View & settle bookings</span></div>
        </a>
        <a routerLink="/stays" class="quick-card">
          <i class="pi pi-building"></i>
          <div><strong>Hotels</strong><span>Luxury hospitality</span></div>
        </a>
        <a routerLink="/cruise" class="quick-card">
          <i class="pi pi-compass"></i>
          <div><strong>Cruise</strong><span>Shore-to-ship packages</span></div>
        </a>
        <a routerLink="/loyalty" class="quick-card">
          <i class="pi pi-star"></i>
          <div><strong>Loyalty</strong><span>Tiers & partners</span></div>
        </a>
        <a routerLink="/checkin" class="quick-card">
          <i class="pi pi-id-card"></i>
          <div><strong>Web Check-in</strong><span>Boarding pass delivery</span></div>
        </a>
        <a routerLink="/concierge" class="quick-card">
          <i class="pi pi-sparkles"></i>
          <div><strong>AI Concierge</strong><span>Travel assistance</span></div>
        </a>
      </div>

      <p-card header="Recent bookings">
        @if (error) { <p class="err">{{ error }}</p> }
        <div class="table-responsive desktop-table">
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
        </div>
        <div class="mobile-list">
          @for (o of recent; track o.bookingReference) {
            <div class="mini-row">
              <strong>{{ o.bookingReference }}</strong>
              <span>{{ o.passengerName }}</span>
              <span>₹{{ o.totalAmount | number }}</span>
              <p-tag [value]="o.status" [severity]="severity(o.status)"></p-tag>
            </div>
          } @empty {
            <p class="empty">No trips yet — <a routerLink="/search">search flights</a> to get started.</p>
          }
        </div>
        <div class="foot">
          <a routerLink="/bookings"><p-button label="Open all trips" [link]="true"></p-button></a>
        </div>
      </p-card>

      <p-card header="Hotel & cruise reservations">
        <div class="table-responsive desktop-table">
          <p-table [value]="reservations" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr><th>Reference</th><th>Type</th><th>Product</th><th>Amount</th><th>Status</th></tr>
            </ng-template>
            <ng-template pTemplate="body" let-r>
              <tr>
                <td><strong>{{ r.reference }}</strong></td>
                <td><p-tag [value]="r.productType" [severity]="r.productType === 'STAY' ? 'warn' : 'info'"></p-tag></td>
                <td>{{ r.productName }}</td>
                <td>₹{{ r.amount | number }}</td>
                <td><p-tag value="CONFIRMED" severity="success"></p-tag></td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr><td colspan="5">No hospitality or cruise reservations — browse <a routerLink="/stays">hotels</a> or <a routerLink="/cruise">cruises</a>.</td></tr>
            </ng-template>
          </p-table>
        </div>
        <div class="mobile-list">
          @for (r of reservations; track r.reference) {
            <div class="mini-row">
              <strong>{{ r.reference }}</strong>
              <p-tag [value]="r.productType" [severity]="r.productType === 'STAY' ? 'warn' : 'info'"></p-tag>
              <span>{{ r.productName }}</span>
              <span>₹{{ r.amount | number }}</span>
            </div>
          } @empty {
            <p class="empty">No hospitality or cruise reservations — browse <a routerLink="/stays">hotels</a> or <a routerLink="/cruise">cruises</a>.</p>
          }
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .dash { display:grid; gap: var(--section-gap); }
    .hero { display:flex; justify-content:space-between; gap: var(--space-4); align-items:flex-start;
      background: linear-gradient(120deg, #0a2a24, #0f4a40 50%, #12324f);
      color:#fff; border-radius:18px; padding: clamp(1.15rem, 2.5vw, 1.4rem) clamp(1.15rem, 2.5vw, 1.5rem); }
    .hero h1 { margin:.45rem 0 .35rem; font-size:clamp(1.35rem, 3vw, 1.65rem); }
    .hero p { margin:0; opacity:.78; max-width:480px; line-height:1.5; }
    .actions { display:flex; gap:.6rem; flex-wrap:wrap; }
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.85rem; }
    .kpi { background:#fff; border:1px solid var(--gray-300); border-radius:14px; padding:1rem; transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out); }
    .kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(6,16,28,.06); }
    .kpi span { display:block; font-size:.75rem; color:#667; }
    .kpi strong { font-size:1.35rem; color:var(--navy); }
    .quick { display:grid; grid-template-columns:repeat(3,1fr); gap:.85rem; }
    .quick-card { display:flex; gap:.85rem; align-items:center; background:#fff; border:1px solid var(--gray-300);
      border-radius:14px; padding:1rem; color:inherit; transition: border-color var(--duration-normal) var(--ease-out), transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out); }
    .quick-card:hover { border-color:var(--teal); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(6,16,28,.06); }
    .quick-card i { font-size:1.35rem; color:var(--teal); }
    .quick-card strong { display:block; }
    .quick-card span { font-size:.78rem; color:#667; }
    .err { color:#c62828; }
    .foot { margin-top:.75rem; }
    .mobile-list { display:none; gap:.65rem; }
    .mini-row { display:grid; gap:.35rem; padding:.75rem 0; border-bottom:1px solid var(--gray-300); }
    .mini-row:last-child { border-bottom:none; }
    .mini-row span { font-size:.88rem; color:#445; }
    .empty { color:#667; font-size:.9rem; margin:0; }
    @media (max-width:900px) {
      .kpi-row { grid-template-columns:1fr 1fr; }
      .quick { grid-template-columns:1fr 1fr; }
      .hero { flex-direction:column; }
    }
    @media (max-width:768px) {
      .desktop-table { display:none; }
      .mobile-list { display:grid; }
      .quick { grid-template-columns:1fr; }
    }
    @media (max-width:480px) {
      .kpi-row { grid-template-columns:1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];
  reservations: PlatformReservation[] = [];
  error = '';

  constructor(private api: ApiService, public auth: AuthService) {}

  get recent() { return this.orders.slice(0, 5); }

  ngOnInit() {
    this.api.getOrders().subscribe({
      next: o => this.orders = o,
      error: () => this.error = 'Failed to load trips'
    });
    this.api.getPlatformReservations().subscribe({
      next: r => this.reservations = r,
      error: () => {}
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
