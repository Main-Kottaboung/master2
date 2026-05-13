import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { CartService } from '../../cart/services/cart.service';
import {
  CreateOrderRequest,
  Order,
  OrderApiResponse,
  OrderCreateResponse,
  OrderListApiResponse
} from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly orderApiUrl = `${environment.apiBaseUrl}/api/orders`;

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly orderSignal = signal<Order | null>(null);
  private readonly ordersSignal = signal<Order[]>([]);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly order = this.orderSignal.asReadonly();
  readonly orders = this.ordersSignal.asReadonly();

  fetchOrders(): Observable<Order[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<OrderListApiResponse | Order[]>(this.orderApiUrl).pipe(
      map((response) => this.normalizeOrderList(response)),
      tap((orders) => this.ordersSignal.set(orders)),
      catchError((error) => {
        this.errorSignal.set('Failed to load orders.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  fetchOrderById(id: number): Observable<Order> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<OrderApiResponse | Order>(`${this.orderApiUrl}/${id}`).pipe(
      map((response) => this.normalizeOrder(response)),
      tap((order) => this.orderSignal.set(order)),
      catchError((error) => {
        this.errorSignal.set('Failed to load order details.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  createOrder(payload: CreateOrderRequest = {}): Observable<Order> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('Not authenticated'));
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<OrderCreateResponse | Order>(this.orderApiUrl, payload).pipe(
      map((response) => this.normalizeOrder(response)),
      tap((order) => this.orderSignal.set(order)),
      tap(() => this.cartService.fetchCart().subscribe({ error: () => {} })),
      catchError((error) => {
        this.errorSignal.set('Failed to place order.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  clearActiveOrder(): void {
    this.orderSignal.set(null);
    this.errorSignal.set(null);
  }

  private normalizeOrderList(response: OrderListApiResponse | Order[]): Order[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response.data ?? response.orders ?? [];
  }

  private normalizeOrder(response: OrderApiResponse | Order | OrderCreateResponse): Order {
    if ('data' in response && response.data) {
      return response.data;
    }

    return response as Order;
  }
}
