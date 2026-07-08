import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Order } from '../../core/services/api.service';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container">
      <div class="card checkin-card">
        <h2>Web Check-in</h2>
        <p>Enter your booking reference to check in online.</p>
        <div class="form-group"><label>Booking Reference</label><input [(ngModel)]="ref" placeholder="ABXXXXXXXX"></div>
        <button class="btn btn-primary" (click)="checkin()">Check In</button>
        @if (error) { <div class="alert-error">{{ error }}</div> }
        @if (result) {
          <div class="alert-success">
            ✓ Checked in successfully!<br>
            Reference: <strong>{{ result.bookingReference }}</strong><br>
            Passenger: {{ result.passengerName }}<br>
            Boarding pass ready for download.
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .checkin-card { max-width: 500px; margin: 0 auto; }
    h2 { color: var(--navy); margin-bottom: 0.5rem; }
  `]
})
export class CheckinComponent {
  ref = ''; error = ''; result: Order | null = null;

  constructor(private api: ApiService) {}

  checkin() {
    this.error = ''; this.result = null;
    this.api.checkIn(this.ref.trim()).subscribe({
      next: o => this.result = o,
      error: e => this.error = e.error?.message || 'Check-in failed'
    });
  }
}
