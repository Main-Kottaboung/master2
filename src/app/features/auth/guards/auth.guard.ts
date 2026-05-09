import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard to protect routes that require authentication
 * Usage: { path: 'admin', canActivate: [authGuard], component: AdminLayout }
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Check role if required by route
    const requiredRole = route.data['role'];
    if (requiredRole && !authService.hasRole(requiredRole)) {
      router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }

  // Not authenticated - redirect to login
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guest guard - prevent authenticated users from accessing public pages like login/register
 * Usage: { path: 'auth/login', canActivate: [guestGuard], component: LoginPage }
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

// Need to import inject for the guards to work
import { inject } from '@angular/core';
