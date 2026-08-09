import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { ApiService, Airport, Ancillary, Offer } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, CardModule, SelectModule, DatePickerModule, TableModule, TagModule,
    DialogModule, StepperModule, InputTextModule, InputNumberModule, CheckboxModule,
    RadioButtonModule, ProgressSpinnerModule, MessageModule, ToastModule, DividerModule
  ],
  template: `
    <div class="container">
      <div class="head">
        <div>
          <h1 class="page-title">Book flights</h1>
          <p class="page-sub">Dynamic offers · live demand · FX-aware pricing · full Order → Settle flow</p>
        </div>
        <p-button label="Live Tracker" icon="pi pi-map" severity="secondary" [outlined]="true" (onClick)="goTracker()"></p-button>
      </div>

      <p-card styleClass="search-card">
        <div class="search-grid">
          <div class="field">
            <label>From</label>
            <p-select [options]="airportOptions" [(ngModel)]="origin" optionLabel="label" optionValue="value" placeholder="Origin" [filter]="true" styleClass="w-full"></p-select>
          </div>
          <div class="field">
            <label>To</label>
            <p-select [options]="airportOptions" [(ngModel)]="destination" optionLabel="label" optionValue="value" placeholder="Destination" [filter]="true" styleClass="w-full"></p-select>
          </div>
          <div class="field">
            <label>Travel date</label>
            <p-datepicker [(ngModel)]="travelDateObj" dateFormat="yy-mm-dd" [minDate]="minDate" styleClass="w-full" inputStyleClass="w-full"></p-datepicker>
          </div>
          <div class="field actions">
            <p-button label="Search flights" icon="pi pi-search" (onClick)="search()" [loading]="loading" styleClass="w-full"></p-button>
          </div>
        </div>
      </p-card>

      @if (pulse) {
        <div class="pulse">
          <p-tag severity="info" value="Market pulse"></p-tag>
          <span>Demand {{ pulse.demandScore }}/100</span>
          <span>EUR→INR {{ pulse.eurInr }}</span>
          <span>{{ pulse.liveFlightsSample?.length || 0 }} live ADS-B samples</span>
          <a [href]="pulse.openSkyApi || 'https://opensky-network.org/api/states/all'" target="_blank" rel="noopener">OpenSky API</a>
        </div>
      }

      @if (error) { <p-message severity="error" [text]="error" styleClass="w-full mt"></p-message> }

      @if (loading) {
        <div class="center"><p-progressSpinner strokeWidth="3"></p-progressSpinner></div>
      }

      @if (offers.length && !loading) {
        <p-card header="Available offers" styleClass="mt">
          <p-table [value]="offers" [paginator]="true" [rows]="6" styleClass="p-datatable-sm" [rowHover]="true">
            <ng-template pTemplate="header">
              <tr>
                <th>Flight</th><th>Date</th><th>Schedule</th><th>Demand</th><th>Cabin</th><th>Price</th><th>Seats</th><th></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-o>
              <tr>
                <td>
                  <strong>{{ o.airline }}</strong><br>
                  <small>{{ o.flightNumber }} · {{ o.origin }} → {{ o.destination }}</small>
                </td>
                <td>{{ o.travelDate }}</td>
                <td>{{ o.departureTime }} – {{ o.arrivalTime }}<br><small>{{ o.durationMinutes }} min</small></td>
                <td><p-tag [severity]="demandSeverity(o.marketStatus)" [value]="o.demandScore + ' · ' + o.marketStatus"></p-tag></td>
                <td><p-tag [value]="o.fareFamily"></p-tag></td>
                <td><strong>₹{{ o.basePrice | number }}</strong></td>
                <td>{{ o.availableSeats }}</td>
                <td><p-button label="Book" icon="pi pi-ticket" size="small" (onClick)="openBooking(o)"></p-button></td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      }

      <p-dialog
        header="Complete booking"
        [(visible)]="bookingVisible"
        [modal]="true"
        [style]="{ width: '820px', maxWidth: '95vw' }"
        [draggable]="false"
        [breakpoints]="{ '960px': '95vw' }">
        @if (selected) {
          <div class="offer-chip">
            <strong>{{ selected.flightNumber }}</strong>
            <span>{{ selected.origin }} → {{ selected.destination }} · {{ selected.travelDate }} · {{ selected.departureTime }}</span>
            <p-tag [value]="'₹' + (selected.basePrice | number)" severity="success"></p-tag>
          </div>

          @if (!auth.isLoggedIn()) {
            <p-message severity="warn" styleClass="w-full mt">
              <ng-template pTemplate>
                Please <a routerLink="/login" (click)="bookingVisible=false">login</a> to continue booking.
              </ng-template>
            </p-message>
          } @else {
            <p-stepper [value]="step" [linear]="true">
              <p-step-list>
                <p-step [value]="1">Passengers</p-step>
                <p-step [value]="2">Extras</p-step>
                <p-step [value]="3">Payment</p-step>
                <p-step [value]="4">Confirm</p-step>
              </p-step-list>
              <p-step-panels>
                <p-step-panel [value]="1">
                  <ng-template #content>
                    <div class="form-grid">
                      <div class="field"><label>Lead passenger</label><input pInputText [(ngModel)]="passengerName" class="w-full" placeholder="Full name"></div>
                      <div class="field"><label>Email</label><input pInputText [(ngModel)]="passengerEmail" class="w-full" type="email"></div>
                      <div class="field"><label>Passengers</label>
                        <p-inputNumber [(ngModel)]="passengers" [min]="1" [max]="9" showButtons styleClass="w-full"></p-inputNumber>
                      </div>
                    </div>
                    <div class="step-actions">
                      <p-button label="Continue" icon="pi pi-arrow-right" iconPos="right" (onClick)="nextFromPassengers()"></p-button>
                    </div>
                  </ng-template>
                </p-step-panel>

                <p-step-panel [value]="2">
                  <ng-template #content>
                    <p class="hint">AI-ranked ancillaries for this OD / cabin</p>
                    <div class="anc-list">
                      @for (a of rankedAncillaries; track a.code) {
                        <div class="anc-item" [class.on]="selectedAncillaries.includes(a.code)" (click)="toggleAncillary(a.code)">
                          <div>
                            <strong>{{ a.name }}</strong>
                            <small>{{ a.reason }}</small>
                          </div>
                          <div class="anc-right">
                            <span>₹{{ priceFor(a.code) | number }}</span>
                            <p-checkbox [binary]="true" [ngModel]="selectedAncillaries.includes(a.code)" (click)="$event.stopPropagation()" (onChange)="toggleAncillary(a.code)"></p-checkbox>
                          </div>
                        </div>
                      }
                    </div>
                    <div class="step-actions">
                      <p-button label="Back" severity="secondary" [text]="true" (onClick)="step=1"></p-button>
                      <p-button label="Continue to payment" icon="pi pi-arrow-right" iconPos="right" (onClick)="step=3"></p-button>
                    </div>
                  </ng-template>
                </p-step-panel>

                <p-step-panel [value]="3">
                  <ng-template #content>
                    <div class="pay-box">
                      <div class="summary">
                        <div><span>Base fare × {{ passengers }}</span><strong>₹{{ baseTotal() | number }}</strong></div>
                        <div><span>Ancillaries</span><strong>₹{{ ancillaryTotal() | number }}</strong></div>
                        <p-divider></p-divider>
                        <div class="total"><span>Total due</span><strong>₹{{ grandTotal() | number }}</strong></div>
                      </div>
                      <div class="pay-methods">
                        <label><p-radioButton name="pay" value="CARD" [(ngModel)]="paymentMethod"></p-radioButton> Card</label>
                        <label><p-radioButton name="pay" value="UPI" [(ngModel)]="paymentMethod"></p-radioButton> UPI</label>
                        <label><p-radioButton name="pay" value="WALLET" [(ngModel)]="paymentMethod"></p-radioButton> Airline wallet</label>
                      </div>
                    </div>
                    <div class="step-actions">
                      <p-button label="Back" severity="secondary" [text]="true" (onClick)="step=2"></p-button>
                      <p-button label="Pay & confirm" icon="pi pi-check" (onClick)="confirmBooking()" [loading]="booking"></p-button>
                    </div>
                  </ng-template>
                </p-step-panel>

                <p-step-panel [value]="4">
                  <ng-template #content>
                    @if (bookSuccess) {
                      <div class="success">
                        <i class="pi pi-check-circle"></i>
                        <h3>Booking confirmed</h3>
                        <p>Reference <strong>{{ bookSuccess }}</strong></p>
                        <p>Payment ID <strong>{{ paymentId }}</strong></p>
                        <p>Status: SETTLED — ready for web check-in</p>
                        <div class="step-actions">
                          <p-button label="My trips" icon="pi pi-briefcase" (onClick)="goBookings()"></p-button>
                          <p-button label="Check-in" severity="secondary" [outlined]="true" (onClick)="goCheckin()"></p-button>
                        </div>
                      </div>
                    }
                  </ng-template>
                </p-step-panel>
              </p-step-panels>
            </p-stepper>
          }
        }
      </p-dialog>
    </div>
  `,
  styles: [`
    .head { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; }
    .search-grid { display:grid; grid-template-columns: 1.2fr 1.2fr 1fr auto; gap:1rem; align-items:end; }
    .field label { display:block; font-size:.8rem; font-weight:600; margin-bottom:.35rem; color:#445; }
    .field.actions { min-width:180px; }
    .pulse { display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; margin:1rem 0; font-size:.9rem; color:#445; }
    .mt { margin-top:1rem; display:block; }
    .center { display:flex; justify-content:center; padding:2rem; }
    .offer-chip { display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; margin-bottom:1rem; padding:.85rem 1rem; background:#f3f7fb; border-radius:10px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .step-actions { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1.25rem; }
    .hint { color:#667; margin-bottom:.75rem; }
    .anc-list { display:grid; gap:.65rem; }
    .anc-item { display:flex; justify-content:space-between; gap:1rem; padding:.85rem 1rem; border:1px solid #d7e0ea; border-radius:10px; cursor:pointer; }
    .anc-item.on { border-color:#00b4a0; background:#e8f8f5; }
    .anc-item small { display:block; color:#667; margin-top:.2rem; }
    .anc-right { display:flex; align-items:center; gap:.75rem; font-weight:700; }
    .pay-box { display:grid; grid-template-columns:1.2fr .8fr; gap:1rem; }
    .summary, .pay-methods { background:#f7fafc; border-radius:10px; padding:1rem; }
    .summary > div { display:flex; justify-content:space-between; margin:.35rem 0; }
    .total { font-size:1.1rem; }
    .pay-methods { display:grid; gap:.85rem; align-content:start; }
    .pay-methods label { display:flex; align-items:center; gap:.55rem; font-weight:600; }
    .success { text-align:center; padding:1rem 0 0; }
    .success i { font-size:2.5rem; color:#00b4a0; }
    .w-full { width:100%; }
    @media (max-width:900px) {
      .search-grid, .form-grid, .pay-box { grid-template-columns:1fr; }
    }
  `]
})
export class SearchComponent implements OnInit {
  origin = 'COK'; destination = 'DXB';
  travelDateObj: Date = new Date();
  minDate = new Date();
  airportOptions: { label: string; value: string }[] = [];
  airports: Airport[] = [];
  offers: Offer[] = [];
  ancillaries: Ancillary[] = [];
  rankedAncillaries: any[] = [];
  selected: Offer | null = null;
  selectedAncillaries: string[] = [];
  passengerName = '';
  passengerEmail = '';
  passengers = 1;
  paymentMethod = 'UPI';
  loading = false;
  booking = false;
  bookingVisible = false;
  step = 1;
  error = '';
  bookSuccess = '';
  paymentId = '';
  pulse: any = null;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private messages: MessageService
  ) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    this.travelDateObj = d;
  }

  ngOnInit() {
    this.api.getAirports().subscribe(a => {
      this.airports = a;
      this.airportOptions = a.map(x => ({ label: `${x.iata} — ${x.city}`, value: x.iata }));
    });
    this.api.getAncillaries().subscribe(a => this.ancillaries = a);
    this.route.queryParams.subscribe(p => {
      if (p['origin']) this.origin = p['origin'];
      if (p['destination']) this.destination = p['destination'];
      if (p['date']) this.travelDateObj = new Date(p['date']);
      if (p['pax']) this.passengers = Number(p['pax']) || 1;
      this.search();
    });
  }

  travelDateStr() {
    const d = this.travelDateObj;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  demandSeverity(status: string) {
    if (status === 'HIGH_DEMAND') return 'danger';
    if (status === 'SOFT') return 'success';
    return 'info';
  }

  search() {
    this.loading = true;
    this.error = '';
    this.api.searchOffers(this.origin, this.destination, this.travelDateStr()).subscribe({
      next: o => { this.offers = o; this.loading = false; },
      error: e => {
        this.error = e.error?.message || 'Failed to fetch offers';
        this.loading = false;
      }
    });
    this.api.getMarketPulse(this.origin, this.destination).subscribe({ next: p => this.pulse = p });
  }

  openBooking(o: Offer) {
    this.selected = o;
    this.bookingVisible = true;
    this.step = 1;
    this.bookSuccess = '';
    this.paymentId = '';
    this.selectedAncillaries = [];
    this.passengerName = this.auth.user()?.fullName || '';
    this.passengerEmail = this.auth.user()?.email || '';
    if (this.auth.isLoggedIn()) {
      this.api.getAncillaryRecommendations(o.origin, o.destination, o.fareFamily).subscribe({
        next: r => this.rankedAncillaries = r,
        error: () => this.rankedAncillaries = this.ancillaries.map(a => ({
          code: a.code, name: a.name, reason: a.description, score: 0.5
        }))
      });
    } else {
      this.rankedAncillaries = this.ancillaries.map(a => ({
        code: a.code, name: a.name, reason: a.description, score: 0.5
      }));
    }
  }

  nextFromPassengers() {
    if (!this.passengerName?.trim() || !this.passengerEmail?.trim()) {
      this.messages.add({ severity: 'warn', summary: 'Passenger details', detail: 'Name and email are required' });
      return;
    }
    this.step = 2;
  }

  toggleAncillary(code: string) {
    if (this.selectedAncillaries.includes(code)) {
      this.selectedAncillaries = this.selectedAncillaries.filter(c => c !== code);
    } else {
      this.selectedAncillaries = [...this.selectedAncillaries, code];
    }
  }

  priceFor(code: string) {
    return this.ancillaries.find(a => a.code === code)?.price ?? 0;
  }

  baseTotal() {
    return (this.selected?.basePrice || 0) * Number(this.passengers || 1);
  }

  ancillaryTotal() {
    return this.selectedAncillaries.reduce((sum, code) => sum + this.priceFor(code), 0) * Number(this.passengers || 1);
  }

  grandTotal() {
    return this.baseTotal() + this.ancillaryTotal();
  }

  confirmBooking() {
    if (!this.selected) return;
    if (!this.auth.isLoggedIn()) {
      this.messages.add({ severity: 'warn', summary: 'Login required', detail: 'Please login to book' });
      return;
    }
    this.booking = true;
    const payload = {
      routeId: Number(this.selected.id),
      passengerName: this.passengerName.trim(),
      passengerEmail: this.passengerEmail.trim(),
      passengers: Number(this.passengers),
      ancillaryCodes: this.selectedAncillaries
    };
    this.api.createOrder(payload).subscribe({
      next: order => {
        this.api.settle(order.bookingReference, this.paymentMethod).subscribe({
          next: settle => {
            this.bookSuccess = settle.bookingReference;
            this.paymentId = settle.paymentId;
            this.step = 4;
            this.booking = false;
            this.messages.add({
              severity: 'success',
              summary: 'Booking settled',
              detail: `${settle.bookingReference} · ${settle.paymentId}`
            });
            this.search();
          },
          error: e => {
            this.booking = false;
            this.messages.add({
              severity: 'error',
              summary: 'Payment failed',
              detail: e.error?.message || 'Settlement failed'
            });
          }
        });
      },
      error: e => {
        this.booking = false;
        this.messages.add({
          severity: 'error',
          summary: 'Booking failed',
          detail: e.error?.message || 'Could not create order'
        });
      }
    });
  }

  goTracker() { this.router.navigate(['/tracker'], { queryParams: { origin: this.origin, destination: this.destination } }); }
  goBookings() { this.bookingVisible = false; this.router.navigate(['/bookings']); }
  goCheckin() { this.bookingVisible = false; this.router.navigate(['/checkin']); }
}
