import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Offer {
  id: number; origin: string; destination: string; airline: string;
  flightNumber: string; travelDate: string; departureTime: string; arrivalTime: string;
  durationMinutes: number; basePrice: number; currency: string; fareFamily: string;
  availableSeats: number; demandScore: number; marketStatus: string; eurInrRate: number;
}

export interface Order {
  id: number; bookingReference: string; routeId: number;
  passengerName: string; passengerEmail: string; passengers: number;
  totalAmount: number; ancillaryCodes: string; status: string;
  paymentId: string | null; paymentMethod: string | null;
  createdAt: string; settledAt: string | null; checkedInAt: string | null;
}

export interface Ancillary {
  id: number; code: string; name: string; description: string; price: number; category: string;
}

export interface SettleResult {
  bookingReference: string; paymentId: string; paymentMethod: string;
  amount: number; currency: string; status: string; settledAt: string;
}

export interface BoardingPass {
  bookingReference: string; passengerName: string; flightNumber: string;
  origin: string; destination: string; departureTime: string; arrivalTime: string;
  seatNumber: string; gate: string; boardingGroup: string; barcode: string;
  fareFamily: string; issuedAt: string;
}

export interface Airport {
  iata: string; name: string; city: string; country: string;
  latitude: number; longitude: number; timezone: string;
}

export interface LiveFlight {
  icao24: string; callsign: string; originCountry: string;
  longitude: number; latitude: number; altitude: number | null;
  velocity: number | null; heading: number | null; onGround: boolean; lastContact: number | null;
}

export interface LiveFlightsResponse {
  source: string; apiUrl: string; docsUrl: string; fetchedAt: string;
  bbox: { lamin: number; lomin: number; lamax: number; lomax: number };
  total: number; airborne: number; flights: LiveFlight[];
}

export interface DashboardPayload {
  kpis: {
    totalOrders: number; settledOrders: number; checkedInOrders: number;
    grossMerchandiseValue: number; averageOrderValue: number;
    settlementRate: number; checkInRate: number; ancillaryAttachRate: number;
  };
  revenueTrend: { date: string; orders: number; revenue: number }[];
  topRoutes: { routeKey: string; bookings: number; revenue: number }[];
  oosdFunnel: { stage: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchOffers(origin: string, destination: string, travelDate: string): Observable<Offer[]> {
    let params = new HttpParams().set('origin', origin).set('destination', destination);
    if (travelDate) params = params.set('travelDate', travelDate);
    return this.http.get<Offer[]>(`${this.API}/offers/search`, { params });
  }

  getOffer(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.API}/offers/${id}`);
  }

  createOrder(body: {
    routeId: number;
    passengerName: string;
    passengerEmail: string;
    passengers: number;
    ancillaryCodes: string[];
  }): Observable<Order> {
    return this.http.post<Order>(`${this.API}/orders`, {
      ...body,
      passengers: Number(body.passengers)
    });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API}/orders`);
  }

  settle(bookingReference: string, paymentMethod: string): Observable<SettleResult> {
    return this.http.post<SettleResult>(`${this.API}/settle`, { bookingReference, paymentMethod });
  }

  checkIn(ref: string): Observable<Order> {
    return this.http.post<Order>(`${this.API}/checkin/${ref}`, {});
  }

  getBoardingPass(ref: string): Observable<BoardingPass> {
    return this.http.get<BoardingPass>(`${this.API}/deliver/boarding-pass/${ref}`);
  }

  getAncillaries(): Observable<Ancillary[]> {
    return this.http.get<Ancillary[]>(`${this.API}/catalog/ancillaries`);
  }

  getRoutes(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.API}/catalog/routes`);
  }

  createRoute(body: object): Observable<Offer> {
    return this.http.post<Offer>(`${this.API}/catalog/routes`, body);
  }

  getAirports(q?: string): Observable<Airport[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<Airport[]>(`${this.API}/market/airports`, { params });
  }

  getMarketPulse(origin: string, destination: string): Observable<any> {
    return this.http.get(`${this.API}/market/pulse`, { params: { origin, destination } });
  }

  getLiveFlights(origin: string, destination: string): Observable<LiveFlightsResponse> {
    return this.http.get<LiveFlightsResponse>(`${this.API}/market/live-flights`, {
      params: { origin, destination }
    });
  }

  getDashboard(): Observable<DashboardPayload> {
    return this.http.get<DashboardPayload>(`${this.API}/analytics/dashboard`);
  }

  getAiInsights(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/ai/insights`);
  }

  askAi(question: string): Observable<any> {
    return this.http.post(`${this.API}/ai/ask`, { question });
  }

  getAncillaryRecommendations(origin: string, destination: string, fareFamily: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/ai/ancillary-recommendations`, {
      params: { origin, destination, fareFamily }
    });
  }

  getDemandForecast(origin: string, destination: string): Observable<any> {
    return this.http.get(`${this.API}/ai/demand-forecast`, { params: { origin, destination } });
  }

  getSolutions(): Observable<Solution[]> {
    return this.http.get<Solution[]>(`${this.API}/platform/solutions`);
  }

  getStays(hub?: string, tier?: string): Observable<Stay[]> {
    let params = new HttpParams();
    if (hub) params = params.set('hub', hub);
    if (tier) params = params.set('tier', tier);
    return this.http.get<Stay[]>(`${this.API}/platform/stays`, { params });
  }

  getCruises(tier?: string): Observable<Cruise[]> {
    let params = new HttpParams();
    if (tier) params = params.set('tier', tier);
    return this.http.get<Cruise[]>(`${this.API}/platform/cruises`, { params });
  }

  getCargoLanes(): Observable<CargoLane[]> {
    return this.http.get<CargoLane[]>(`${this.API}/platform/cargo/lanes`);
  }

  getLoyalty(): Observable<{ program: string; tiers: LoyaltyTier[]; partners: LoyaltyPartner[] }> {
    return this.http.get<{ program: string; tiers: LoyaltyTier[]; partners: LoyaltyPartner[] }>(`${this.API}/platform/loyalty`);
  }

  askConcierge(question: string, locale = 'en'): Observable<ConciergeReply> {
    return this.http.post<ConciergeReply>(`${this.API}/platform/concierge/ask`, { question, locale });
  }
}

export interface Solution {
  code: string; name: string; domain: string; blurb: string; route: string; icon: string; pillars: string[];
}
export interface Stay {
  id: string; name: string; city: string; country: string; tier: string; stars: number;
  priceFrom: number; currency: string; blurb: string; amenities: string[]; hubAirport: string;
}
export interface Cruise {
  id: string; name: string; ship: string; embarkPort: string; portsOfCall: string;
  nights: number; priceFrom: number; currency: string; tier: string; perks: string[]; blurb: string;
}
export interface CargoLane {
  code: string; lane: string; commodity: string; capacityScore: number; etdHours: number; note: string;
}
export interface LoyaltyTier {
  code: string; name: string; pointsThreshold: number; earnMultiplier: number; perk: string;
}
export interface LoyaltyPartner { name: string; category: string; offer: string; }
export interface ConciergeReply {
  answer: string; mode: string; suggestedActions: string[]; context: Record<string, unknown>;
}
