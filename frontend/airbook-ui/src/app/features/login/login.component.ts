import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  template: `
    <div class="container wrap">
      <p-card styleClass="login-card">
        <h2>Sign in</h2>
        <p class="hint">Customer: customer&#64;airbook.com / customer123 · Admin: admin&#64;airbook.com / admin123</p>
        @if (error) { <p-message severity="error" [text]="error" styleClass="w-full mb"></p-message> }
        <div class="field"><label>Email</label><input pInputText class="w-full" [(ngModel)]="email" type="email"></div>
        <div class="field"><label>Password</label><p-password [(ngModel)]="password" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password></div>
        <p-button label="Login" icon="pi pi-sign-in" styleClass="w-full" [loading]="loading" (onClick)="login()"></p-button>
      </p-card>
    </div>
  `,
  styles: [`
    .wrap { display:flex; justify-content:center; padding-top:2rem; }
    :host ::ng-deep .login-card { width:100%; max-width:420px; }
    h2 { margin:0 0 .5rem; color:#071526; }
    .hint { color:#667; font-size:.85rem; margin-bottom:1rem; }
    .field { margin-bottom:1rem; }
    .field label { display:block; font-weight:600; font-size:.8rem; margin-bottom:.3rem; }
    .w-full { width:100%; }
    .mb { margin-bottom:1rem; display:block; }
  `]
})
export class LoginComponent {
  email = 'customer@airbook.com';
  password = 'customer123';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.router.navigate(['/search']); this.loading = false; },
      error: () => { this.error = 'Invalid credentials or API unavailable'; this.loading = false; }
    });
  }
}
