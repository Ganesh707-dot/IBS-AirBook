import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Offer } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Admin CMS — Route Catalog</h2>
      @if (!auth.isAdmin()) { <div class="alert-error">Admin access only. Login as admin@airbook.com</div> }
      @else {
        <div class="card" style="margin-bottom:1.5rem">
          <h3>Add Route</h3>
          <div class="admin-grid">
            <div class="form-group"><label>Origin</label><input [(ngModel)]="form.origin" maxlength="3"></div>
            <div class="form-group"><label>Destination</label><input [(ngModel)]="form.destination" maxlength="3"></div>
            <div class="form-group"><label>Flight No</label><input [(ngModel)]="form.flightNumber"></div>
            <div class="form-group"><label>Departure</label><input [(ngModel)]="form.departureTime" placeholder="HH:MM"></div>
            <div class="form-group"><label>Arrival</label><input [(ngModel)]="form.arrivalTime" placeholder="HH:MM"></div>
            <div class="form-group"><label>Duration (min)</label><input [(ngModel)]="form.durationMinutes" type="number"></div>
            <div class="form-group"><label>Price</label><input [(ngModel)]="form.basePrice" type="number"></div>
            <div class="form-group"><label>Fare Family</label><select [(ngModel)]="form.fareFamily"><option>ECONOMY</option><option>BUSINESS</option><option>PREMIUM</option></select></div>
            <div class="form-group"><label>Seats</label><input [(ngModel)]="form.availableSeats" type="number"></div>
            <button class="btn btn-primary" (click)="addRoute()">Add Route</button>
          </div>
          @if (msg) { <div class="alert-success">{{ msg }}</div> }
        </div>
        <table class="card">
          <thead><tr><th>Flight</th><th>Route</th><th>Schedule</th><th>Fare</th><th>Price</th><th>Seats</th></tr></thead>
          <tbody>
            @for (r of routes; track r.id) {
              <tr>
                <td>{{ r.flightNumber }}</td>
                <td>{{ r.origin }} → {{ r.destination }}</td>
                <td>{{ r.departureTime }} - {{ r.arrivalTime }}</td>
                <td>{{ r.fareFamily }}</td>
                <td>₹{{ r.basePrice | number }}</td>
                <td>{{ r.availableSeats }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    h2 { margin-bottom: 1rem; color: var(--navy); }
    .admin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; align-items: end; }
    @media(max-width:768px) { .admin-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminComponent implements OnInit {
  routes: Offer[] = []; msg = '';
  form = { origin: '', destination: '', airline: 'AirBook', flightNumber: '', departureTime: '', arrivalTime: '', durationMinutes: 180, basePrice: 20000, fareFamily: 'ECONOMY', availableSeats: 150 };

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getRoutes().subscribe(r => this.routes = r);
  }

  addRoute() {
    this.api.createRoute(this.form).subscribe({
      next: () => { this.msg = 'Route added successfully'; this.load(); },
      error: e => this.msg = e.error?.message || 'Failed'
    });
  }
}
