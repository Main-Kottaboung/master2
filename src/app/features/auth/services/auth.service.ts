import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  UserRole,
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  BackendLoginResponse,
  ApiErrorResponse,
  AuthUserDto
} from '../interfaces/auth-api.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Backend API URL

  // Signals for reactive state
  private userSignal = signal<AuthUserDto | null>(null);
  private tokenSignal = signal<string | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  // Public computed signals
  user = this.userSignal.asReadonly();
  token = this.tokenSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  isAuthenticated = computed(() => this.userSignal() !== null && this.tokenSignal() !== null);

  constructor(private http: HttpClient) {
    this.initializeAuth();
    this.setupAutoLogout();
  }

  /**
   * Initialize auth from localStorage (auto-login on app init)
   * Public so APP_INITIALIZER can call it explicitly
   */
  public initializeAuth() {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.tokenSignal.set(storedToken);
        this.userSignal.set(user);
      } catch (e) {
        console.error('Failed to restore auth from localStorage', e);
        this.clearAuth();
      }
    }
  }

  /**
   * Setup auto-logout if token expires
   */
  private setupAutoLogout() {
    effect(() => {
      const token = this.tokenSignal();
      if (token) {
        const payload = this.parseJwt(token);
        if (payload && payload.exp) {
          const expiresIn = payload.exp * 1000 - Date.now();
          if (expiresIn > 0) {
            setTimeout(() => {
              this.logout();
            }, expiresIn);
          }
        }
      }
    });
  }

  private normalizeLoginResponse(
    response: BackendLoginResponse
  ): LoginResponse {
    return {
      user: response.data,
      token: response.token
    };
  }

  /**
   * Login user and store token
   */
  async login(request: LoginRequest) {
    this.clearError();
    this.loadingSignal.set(true);

    try {
      const obs = this.http.post<BackendLoginResponse>(`${this.apiUrl}/login`, request).pipe(
        tap((res) => console.debug('[AuthService] login response:', res)),
        catchError((err) => {
          console.error('[AuthService] login API error:', err);
          return throwError(() => err);
        })
      );

      const response = await firstValueFrom(obs);
      const normalized = this.normalizeLoginResponse(response);

      console.debug('[AuthService] normalized login response:', normalized);

      this.setAuthState(normalized);
      return normalized;
    } catch (error: any) {
      const message = (error?.error as ApiErrorResponse)?.message || error?.message || 'Login failed';
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Register new user
   */
  async register(request: RegisterRequest) {
    this.clearError();
    this.loadingSignal.set(true);

    try {
      const obs = this.http.post<BackendLoginResponse>(`${this.apiUrl}/register`, request).pipe(
        tap((raw) => console.debug('[AuthService] raw register response:', raw)),
        catchError((err) => {
          console.error('[AuthService] register API error:', err);
          return throwError(() => err);
        })
      );

      const response = await firstValueFrom(obs);
      const normalized = this.normalizeLoginResponse(response);

      console.debug('[AuthService] normalized register response:', normalized);

      this.setAuthState(normalized);
      return normalized;
    } catch (error: any) {
      const message = (error?.error as ApiErrorResponse)?.message || error?.message || 'Registration failed';
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Logout user and clear state
   */
  logout() {
    this.clearAuth();
  }

  /**
   * Set auth state and persist to localStorage
   */
  private setAuthState(response: LoginResponse) {
    if (!response?.user || !response?.token) {
      throw new Error('Invalid auth response');
    }

    this.userSignal.set(response.user);
    this.tokenSignal.set(response.token);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      } catch (e) {
        console.error('[AuthService] Failed to persist auth state', e);
      }
    }
  }

  /**
   * Clear auth state and localStorage
   */
  private clearAuth() {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    this.errorSignal.set(null);

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Clear error message
   */
  private clearError() {
    this.errorSignal.set(null);
  }

  /**
   * Parse JWT token payload
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUserDto | null {
    return this.userSignal();
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.userSignal();
    return user?.role === role;
  }
}
