import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container login-wrap">
      <div class="card login-card">
        <h2>Sign In</h2>
        <p class="hint">Demo: customer@airbook.com / customer123</p>
        @if (error) { <div class="alert-error">{{ error }}</div> }
        <div class="form-group"><label>Email</label><input [(ngModel)]="email" type="email"></div>
        <div class="form-group"><label>Password</label><input [(ngModel)]="password" type="password"></div>
        <button class="btn btn-primary" (click)="login()" [disabled]="loading">{{ loading ? 'Signing in...' : 'Login' }}</button>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap { display: flex; justify-content: center; padding-top: 2rem; }
    .login-card { width: 100%; max-width: 400px; }
    .hint { font-size: 0.85rem; color: #666; margin-bottom: 1rem; }
  `]
})
export class LoginComponent {
  email = 'customer@airbook.com'; password = 'customer123';
  error = ''; loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.router.navigate(['/bookings']); this.loading = false; },
      error: () => { this.error = 'Invalid credentials or backend unavailable'; this.loading = false; }
    });
  }
}
