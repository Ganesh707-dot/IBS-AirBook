import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Order, BoardingPass } from '../../core/services/api.service';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container page-shell page-stack">
      <div class="card checkin-card animate-slide-up">
        <h2>Web Check-in & Deliver</h2>
        <p>Enter your settled booking reference to check in and receive a boarding pass.</p>
        <div class="form-group"><label>Booking Reference</label><input [(ngModel)]="ref" placeholder="ABXXXXXXXX"></div>
        <button class="btn btn-primary" (click)="checkin()">Check In</button>
        @if (error) { <div class="alert-error">{{ error }}</div> }
        @if (result) {
          <div class="alert-success">
            Checked in successfully!<br>
            Reference: <strong>{{ result.bookingReference }}</strong><br>
            Passenger: {{ result.passengerName }}
          </div>
        }
        @if (pass) {
          <div class="boarding-pass">
            <div class="bp-header">
              <span>BOARDING PASS</span>
              <strong>{{ pass.flightNumber }}</strong>
            </div>
            <div class="bp-body">
              <div>
                <small>Passenger</small>
                <strong>{{ pass.passengerName }}</strong>
              </div>
              <div class="route">
                <div><small>From</small><strong>{{ pass.origin }}</strong></div>
                <div class="arrow">→</div>
                <div><small>To</small><strong>{{ pass.destination }}</strong></div>
              </div>
              <div class="meta">
                <div><small>Seat</small><strong>{{ pass.seatNumber }}</strong></div>
                <div><small>Gate</small><strong>{{ pass.gate }}</strong></div>
                <div><small>Group</small><strong>{{ pass.boardingGroup }}</strong></div>
                <div><small>Dep</small><strong>{{ pass.departureTime }}</strong></div>
              </div>
              <div class="barcode">{{ pass.barcode }}</div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .checkin-card { max-width: 560px; margin: 0 auto; width: 100%; }
    h2 { color: var(--navy); margin-bottom: 0.5rem; }
    .btn { width: 100%; min-height: 44px; margin-top: 0.5rem; }
    .boarding-pass { margin-top: 1.25rem; border: 2px dashed var(--teal); border-radius: 12px; overflow: hidden; animation: slide-up var(--duration-normal) var(--ease-out) both; }
    .bp-header { background: var(--navy); color: white; padding: 0.85rem 1rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
    .bp-body { padding: 1rem; display: grid; gap: 1rem; }
    .bp-body small { display: block; color: #667; font-size: 0.75rem; }
    .route { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .arrow { color: var(--teal); font-size: 1.4rem; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    .barcode { font-family: monospace; letter-spacing: 1px; background: var(--gray-100); padding: 0.65rem; border-radius: 6px; word-break: break-all; font-size: 0.8rem; }
    @media (max-width: 600px) { .meta { grid-template-columns: 1fr 1fr; } }
  `]
})
export class CheckinComponent {
  ref = ''; error = ''; result: Order | null = null; pass: BoardingPass | null = null;

  constructor(private api: ApiService) {}

  checkin() {
    this.error = ''; this.result = null; this.pass = null;
    this.api.checkIn(this.ref.trim()).subscribe({
      next: o => {
        this.result = o;
        this.api.getBoardingPass(o.bookingReference).subscribe({
          next: bp => this.pass = bp,
          error: e => this.error = e.error?.message || 'Boarding pass unavailable'
        });
      },
      error: e => this.error = e.error?.message || 'Check-in failed'
    });
  }
}
