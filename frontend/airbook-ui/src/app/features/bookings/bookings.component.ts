import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService, Order } from '../../core/services/api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="container">
      <h2>My Bookings</h2>
      @if (error) { <div class="alert-error">{{ error }}</div> }
      @if (!orders.length && !error) { <p>No bookings yet. <a href="/search">Search flights</a></p> }
      @if (orders.length) {
        <table class="card">
          <thead><tr><th>Reference</th><th>Passenger</th><th>Pax</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            @for (o of orders; track o.id) {
              <tr>
                <td><strong>{{ o.bookingReference }}</strong></td>
                <td>{{ o.passengerName }}</td>
                <td>{{ o.passengers }}</td>
                <td>₹{{ o.totalAmount | number }}</td>
                <td><span class="badge badge-{{ o.status.toLowerCase() }}">{{ o.status }}</span></td>
                <td>{{ o.createdAt | date:'medium' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`h2 { margin-bottom: 1rem; color: var(--navy); }`]
})
export class BookingsComponent implements OnInit {
  orders: Order[] = []; error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getOrders().subscribe({
      next: o => this.orders = o,
      error: () => this.error = 'Failed to load bookings'
    });
  }
}
