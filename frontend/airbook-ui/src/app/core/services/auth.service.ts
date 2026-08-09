import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
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

  constructor(private http: HttpClient, private router: Router) {
    this.syncProfile();
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; email: string; fullName: string; role: string }>(
      `${this.API}/login`, { email, password }
    ).pipe(tap(res => {
      const user: AuthUser = { ...res };
      localStorage.setItem('airbook_user', JSON.stringify(user));
      this.user.set(user);
    }));
  }

  /** Refresh role/name from server so ANALYST isn't stuck as ADMIN in localStorage. */
  syncProfile() {
    const current = this.user();
    if (!current?.token) return;
    this.http.get<{ email: string; fullName: string; role: string }>(`${this.API}/me`).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (!res) return;
      const next: AuthUser = { ...current, email: res.email, fullName: res.fullName, role: res.role };
      localStorage.setItem('airbook_user', JSON.stringify(next));
      this.user.set(next);
    });
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

  homeRoute(): string {
    if (this.isAdmin()) return '/admin';
    if (this.isAnalyst()) return '/bi';
    if (this.isCustomer()) return '/dashboard';
    return '/';
  }

  private loadStored(): AuthUser | null {
    const raw = localStorage.getItem('airbook_user');
    return raw ? JSON.parse(raw) : null;
  }
}
