import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type UserRole = 'ADMIN' | 'ANALYST' | 'CUSTOMER';

export interface AuthUser {
  email: string;
  fullName: string;
  role: UserRole | string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  user = signal<AuthUser | null>(this.loadStored());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string; email: string; fullName: string; role: string }>(
      `${this.API}/login`, { email, password }
    ).pipe(tap(res => {
      const user: AuthUser = { ...res };
      localStorage.setItem('airbook_user', JSON.stringify(user));
      this.user.set(user);
    }));
  }

  logout() {
    localStorage.removeItem('airbook_user');
    this.user.set(null);
    this.router.navigate(['/']);
  }

  isLoggedIn() { return !!this.user(); }
  role() { return (this.user()?.role || '').toUpperCase(); }
  isAdmin() { return this.role() === 'ADMIN'; }
  isAnalyst() { return this.role() === 'ANALYST'; }
  isCustomer() { return this.role() === 'CUSTOMER'; }
  hasAnyRole(...roles: string[]) {
    const r = this.role();
    return roles.map(x => x.toUpperCase()).includes(r);
  }
  canAccessBi() { return this.hasAnyRole('ADMIN', 'ANALYST'); }
  getToken() { return this.user()?.token ?? ''; }

  /** Role-based landing after login */
  homeRoute(): string {
    if (this.isAdmin()) return '/admin';
    if (this.isAnalyst()) return '/bi';
    if (this.isCustomer()) return '/dashboard';
    return '/search';
  }

  private loadStored(): AuthUser | null {
    const raw = localStorage.getItem('airbook_user');
    return raw ? JSON.parse(raw) : null;
  }
}
