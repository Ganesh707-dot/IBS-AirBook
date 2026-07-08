import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
  id: number; origin: string; destination: string; airline: string;
  flightNumber: string; departureTime: string; arrivalTime: string;
  durationMinutes: number; basePrice: number; fareFamily: string; availableSeats: number;
}

export interface Order {
  id: number; bookingReference: string; routeId: number;
  passengerName: string; passengerEmail: string; passengers: number;
  totalAmount: number; ancillaryCodes: string; status: string;
  createdAt: string; checkedInAt: string | null;
}

export interface Ancillary {
  id: number; code: string; name: string; description: string; price: number; category: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  searchOffers(origin: string, destination: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.API}/offers/search`, { params: { origin, destination } });
  }

  createOrder(body: object): Observable<Order> {
    return this.http.post<Order>(`${this.API}/orders`, body);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API}/orders`);
  }

  checkIn(ref: string): Observable<Order> {
    return this.http.post<Order>(`${this.API}/checkin/${ref}`, {});
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
}
