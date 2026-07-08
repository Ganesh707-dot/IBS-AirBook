import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <section class="hero">
      <div class="container">
        <p class="tag">Inspired by IBS iRetail & iFly</p>
        <h1>Where retail meets<br><span>airline excellence</span></h1>
        <p class="subtitle">Offer–Order–Settle–Deliver platform for modern airline passenger services</p>
        <form class="search-card card" (ngSubmit)="goSearch()">
          <div class="search-grid">
            <div class="form-group"><label>From</label><input [(ngModel)]="origin" name="origin" placeholder="COK" maxlength="3"></div>
            <div class="form-group"><label>To</label><input [(ngModel)]="destination" name="dest" placeholder="DXB" maxlength="3"></div>
            <div class="form-group"><label>Passengers</label><select [(ngModel)]="passengers" name="pax"><option *ngFor="let n of [1,2,3,4,5,6]" [value]="n">{{n}}</option></select></div>
            <button type="submit" class="btn btn-primary search-btn">Search Flights</button>
          </div>
        </form>
      </div>
    </section>
    <section class="features container">
      <div class="feature card"><h3>Offer Management</h3><p>Search fare families, branded fares, and dynamic airline offers across channels.</p></div>
      <div class="feature card"><h3>Order Booking</h3><p>Create passenger orders with ancillary upsell — baggage, meals, priority boarding.</p></div>
      <div class="feature card"><h3>Web Check-in</h3><p>Self-service check-in with boarding pass generation and status tracking.</p></div>
    </section>
  `,
  styles: [`
    .hero { background: linear-gradient(135deg, var(--navy) 0%, #0d2847 100%); color: white; padding: 4rem 0 5rem; }
    .tag { color: var(--teal); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }
    h1 { font-size: 2.75rem; line-height: 1.2; margin-bottom: 1rem; }
    h1 span { color: var(--teal); }
    .subtitle { opacity: 0.8; margin-bottom: 2rem; max-width: 550px; }
    .search-card { max-width: 800px; }
    .search-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: end; }
    .search-btn { height: 42px; white-space: nowrap; }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: -2rem; position: relative; z-index: 1; padding-bottom: 2rem; }
    .feature h3 { color: var(--navy); margin-bottom: 0.5rem; }
    .feature p { font-size: 0.9rem; color: #555; }
    @media (max-width: 768px) { .search-grid, .features { grid-template-columns: 1fr; } h1 { font-size: 2rem; } }
  `]
})
export class HomeComponent {
  origin = 'COK'; destination = 'DXB'; passengers = 1;

  goSearch() {
    window.location.href = `/search?origin=${this.origin}&destination=${this.destination}&pax=${this.passengers}`;
  }
}
