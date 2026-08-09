import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

/** Factory: require one of the given roles (enterprise RBAC). */
export function roleGuard(...roles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }
    if (auth.hasAnyRole(...roles)) return true;
    router.navigate([auth.homeRoute()]);
    return false;
  };
}

export const adminGuard = roleGuard('ADMIN');
export const analystGuard = roleGuard('ADMIN', 'ANALYST');
export const customerGuard = roleGuard('CUSTOMER', 'ADMIN');
