import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Order } from '../../core/services/api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="container">
      <h2>My Bookings</h2>
      @if (error) { <div class="alert-error">{{ error }}</div> }
      @if (!orders.length && !error) { <p>No bookings yet. <a routerLink="/search">Search flights</a></p> }
      @if (orders.length) {
        <table class="card">
          <thead><tr><th>Reference</th><th>Passenger</th><th>Pax</th><th>Amount</th><th>Status</th><th>Payment</th><th>Date</th><th></th></tr></thead>
          <tbody>
            @for (o of orders; track o.id) {
              <tr>
                <td><strong>{{ o.bookingReference }}</strong></td>
                <td>{{ o.passengerName }}</td>
                <td>{{ o.passengers }}</td>
                <td>₹{{ o.totalAmount | number }}</td>
                <td><span class="badge badge-{{ statusClass(o.status) }}">{{ o.status }}</span></td>
                <td>{{ o.paymentId || '—' }}</td>
                <td>{{ o.createdAt | date:'medium' }}</td>
                <td>
                  @if (o.status === 'PENDING_PAYMENT') {
                    <button class="btn btn-primary btn-sm" (click)="pay(o)">Settle</button>
                  }
                  @if (o.status === 'SETTLED') {
                    <a routerLink="/checkin" class="btn btn-outline btn-sm">Check-in</a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    h2 { margin-bottom: 1rem; color: var(--navy); }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
  `]
})
export class BookingsComponent implements OnInit {
  orders: Order[] = []; error = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  statusClass(status: string) {
    return status.toLowerCase().replace(/_/g, '-');
  }

  load() {
    this.api.getOrders().subscribe({
      next: o => this.orders = o,
      error: () => this.error = 'Failed to load bookings'
    });
  }

  pay(order: Order) {
    this.api.settle(order.bookingReference, 'CARD').subscribe({
      next: () => this.load(),
      error: e => this.error = e.error?.message || 'Settlement failed'
    });
  }
}
