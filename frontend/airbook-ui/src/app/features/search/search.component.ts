import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Offer, Ancillary } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <h2>Flight Offers</h2>
      <form class="card filter-bar" (ngSubmit)="search()">
        <div class="filter-grid">
          <div class="form-group"><label>From</label><input [(ngModel)]="origin" name="o" maxlength="3"></div>
          <div class="form-group"><label>To</label><input [(ngModel)]="destination" name="d" maxlength="3"></div>
          <button class="btn btn-primary" type="submit">Search</button>
        </div>
      </form>

      @if (error) { <div class="alert-error">{{ error }}</div> }
      @if (loading) { <p>Searching offers...</p> }

      @if (offers.length) {
        <table class="card" style="margin-top:1rem">
          <thead><tr><th>Flight</th><th>Route</th><th>Time</th><th>Duration</th><th>Fare Family</th><th>Price</th><th>Seats</th><th></th></tr></thead>
          <tbody>
            @for (o of offers; track o.id) {
              <tr>
                <td><strong>{{ o.airline }}</strong><br><small>{{ o.flightNumber }}</small></td>
                <td>{{ o.origin }} → {{ o.destination }}</td>
                <td>{{ o.departureTime }} - {{ o.arrivalTime }}</td>
                <td>{{ o.durationMinutes }} min</td>
                <td><span class="badge badge-{{ o.fareFamily.toLowerCase() }}">{{ o.fareFamily }}</span></td>
                <td>₹{{ o.basePrice | number }}</td>
                <td>{{ o.availableSeats }}</td>
                <td><button class="btn btn-primary btn-sm" (click)="selectOffer(o)">Book</button></td>
              </tr>
            }
          </tbody>
        </table>
      }

      @if (selected) {
        <div class="card booking-panel">
          <h3>Complete Booking — {{ selected.flightNumber }}</h3>
          @if (!auth.isLoggedIn()) { <div class="alert-error">Please <a routerLink="/login">login</a> to book.</div> }
          <div class="form-group"><label>Passenger Name</label><input [(ngModel)]="passengerName"></div>
          <div class="form-group"><label>Email</label><input [(ngModel)]="passengerEmail" type="email"></div>
          <div class="form-group"><label>Passengers</label><input [(ngModel)]="passengers" type="number" min="1" max="9"></div>
          <div class="form-group"><label>Ancillaries</label>
            @for (a of ancillaries; track a.code) {
              <label class="check"><input type="checkbox" [value]="a.code" (change)="toggleAncillary(a.code, $event)"> {{ a.name }} (+₹{{ a.price }})</label>
            }
          </div>
          <button class="btn btn-primary" (click)="book()" [disabled]="!auth.isLoggedIn()">Confirm Booking</button>
          @if (bookSuccess) { <div class="alert-success">Booked! Ref: {{ bookSuccess }}</div> }
        </div>
      }
    </div>
  `,
  styles: [`
    h2 { margin-bottom: 1rem; color: var(--navy); }
    .filter-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    .booking-panel { margin-top: 1.5rem; }
    .check { display: block; margin: 0.35rem 0; font-size: 0.9rem; }
    @media (max-width:768px) { .filter-grid { grid-template-columns: 1fr; } }
  `]
})
export class SearchComponent implements OnInit {
  origin = 'COK'; destination = 'DXB'; passengers = 1;
  passengerName = ''; passengerEmail = '';
  offers: Offer[] = []; ancillaries: Ancillary[] = [];
  selected: Offer | null = null; selectedAncillaries: string[] = [];
  loading = false; error = ''; bookSuccess = '';

  constructor(private api: ApiService, public auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['origin']) this.origin = p['origin'];
      if (p['destination']) this.destination = p['destination'];
      if (p['pax']) this.passengers = +p['pax'];
      this.search();
    });
    this.api.getAncillaries().subscribe(a => this.ancillaries = a);
  }

  search() {
    this.loading = true; this.error = ''; this.selected = null;
    this.api.searchOffers(this.origin, this.destination).subscribe({
      next: o => { this.offers = o; this.loading = false; },
      error: () => { this.error = 'Failed to fetch offers. Is backend running on :8080?'; this.loading = false; }
    });
  }

  selectOffer(o: Offer) { this.selected = o; this.bookSuccess = ''; }

  toggleAncillary(code: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedAncillaries.push(code);
    else this.selectedAncillaries = this.selectedAncillaries.filter(c => c !== code);
  }

  book() {
    if (!this.selected) return;
    this.api.createOrder({
      routeId: this.selected.id,
      passengerName: this.passengerName,
      passengerEmail: this.passengerEmail,
      passengers: this.passengers,
      ancillaryCodes: this.selectedAncillaries
    }).subscribe({
      next: o => { this.bookSuccess = o.bookingReference; this.search(); },
      error: e => this.error = e.error?.message || 'Booking failed'
    });
  }
}
