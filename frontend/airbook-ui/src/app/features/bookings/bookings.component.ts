import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ApiService, Order } from '../../core/services/api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, TableModule, ButtonModule, TagModule, CardModule, MessageModule],
  template: `
    <div class="container page-shell page-stack">
      <div class="screen-head">
        <div>
          <h2 class="page-title">My Trips</h2>
          <p class="page-sub">Customer booking ledger — settle payments and jump to check-in.</p>
        </div>
        <a routerLink="/search"><p-button label="Book flight" icon="pi pi-plus"></p-button></a>
      </div>

      @if (error) { <p-message severity="error" [text]="error" styleClass="w-full mb"></p-message> }

      <!-- Desktop / tablet table -->
      <p-card class="desktop-table">
        <div class="table-responsive">
          <p-table [value]="orders" [paginator]="true" [rows]="8" styleClass="p-datatable-sm" [loading]="loading">
            <ng-template pTemplate="header">
              <tr>
                <th>Reference</th>
                <th>Passenger</th>
                <th>Pax</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-o>
              <tr>
                <td><strong>{{ o.bookingReference }}</strong></td>
                <td>{{ o.passengerName }}</td>
                <td>{{ o.passengers }}</td>
                <td>₹{{ o.totalAmount | number }}</td>
                <td><p-tag [value]="o.status" [severity]="severity(o.status)"></p-tag></td>
                <td>{{ o.paymentId || '—' }}</td>
                <td>{{ o.createdAt | date:'medium' }}</td>
                <td class="acts">
                  @if (o.status === 'PENDING_PAYMENT') {
                    <p-button label="Settle" size="small" (onClick)="pay(o)"></p-button>
                  }
                  @if (o.status === 'SETTLED') {
                    <a routerLink="/checkin"><p-button label="Check-in" size="small" [outlined]="true"></p-button></a>
                  }
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr><td colspan="8">No bookings yet. <a routerLink="/search">Search flights</a></td></tr>
            </ng-template>
          </p-table>
        </div>
      </p-card>

      <!-- Mobile card list -->
      <div class="mobile-cards stagger">
        @if (loading) {
          <div class="loading">Loading trips…</div>
        } @else if (!orders.length) {
          <p-card><p>No bookings yet. <a routerLink="/search">Search flights</a></p></p-card>
        } @else {
          @for (o of orders; track o.bookingReference) {
            <article class="trip-card card">
              <div class="trip-top">
                <strong>{{ o.bookingReference }}</strong>
                <p-tag [value]="o.status" [severity]="severity(o.status)"></p-tag>
              </div>
              <div class="trip-meta">
                <div><small>Passenger</small><span>{{ o.passengerName }}</span></div>
                <div><small>Amount</small><span>₹{{ o.totalAmount | number }}</span></div>
                <div><small>Pax</small><span>{{ o.passengers }}</span></div>
                <div><small>Date</small><span>{{ o.createdAt | date:'mediumDate' }}</span></div>
              </div>
              @if (o.paymentId) { <div class="pay-id"><small>Payment</small> {{ o.paymentId }}</div> }
              <div class="acts">
                @if (o.status === 'PENDING_PAYMENT') {
                  <p-button label="Settle" size="small" styleClass="w-full" (onClick)="pay(o)"></p-button>
                }
                @if (o.status === 'SETTLED') {
                  <a routerLink="/checkin" class="w-full"><p-button label="Check-in" size="small" [outlined]="true" styleClass="w-full"></p-button></a>
                }
              </div>
            </article>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .mb { margin-bottom: var(--space-4); display: block; }
    .acts { display: flex; gap: .35rem; flex-wrap: wrap; }
    .w-full { width: 100%; display: block; }
    .mobile-cards { display: none; gap: .85rem; }
    .trip-card { display: grid; gap: .75rem; }
    .trip-top { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
    .trip-meta { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
    .trip-meta small, .pay-id small { display: block; font-size: .68rem; color: #667; font-weight: 650; text-transform: uppercase; letter-spacing: .04em; }
    .trip-meta span { font-weight: 600; font-size: .9rem; }
    .pay-id { font-size: .82rem; color: #445; word-break: break-all; }
    .loading { text-align: center; padding: 2rem; color: #667; }
    @media (max-width: 768px) {
      .desktop-table { display: none; }
      .mobile-cards { display: grid; }
    }
  `]
})
export class BookingsComponent implements OnInit {
  orders: Order[] = [];
  error = '';
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  severity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (status === 'CHECKED_IN') return 'success';
    if (status === 'SETTLED') return 'info';
    if (status === 'PENDING_PAYMENT') return 'warn';
    if (status === 'CANCELLED') return 'danger';
    return 'secondary';
  }

  load() {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: o => { this.orders = o; this.loading = false; },
      error: () => { this.error = 'Failed to load bookings'; this.loading = false; }
    });
  }

  pay(order: Order) {
    this.api.settle(order.bookingReference, 'CARD').subscribe({
      next: () => this.load(),
      error: e => this.error = e.error?.message || 'Settlement failed'
    });
  }
}
