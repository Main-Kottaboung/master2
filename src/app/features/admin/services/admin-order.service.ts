import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminOrder,
  AdminOrderApiResponse,
  AdminOrderListApiResponse,
  AdminOrderQueryParams,
  AdminOrderUpdateResponse,
  AdminOrderListMeta
} from '../models/admin-order';
import { OrderStatus } from '../../orders/models/order';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly orderApiUrl = `${environment.apiBaseUrl}/api/admin/orders`;

  private readonly loadingSignal = signal(false);
  private readonly updatingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly orderSignal = signal<AdminOrder | null>(null);
  private readonly ordersSignal = signal<AdminOrder[]>([]);
  private readonly metaSignal = signal<AdminOrderListMeta>({});

  readonly loading = this.loadingSignal.asReadonly();
  readonly updating = this.updatingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly order = this.orderSignal.asReadonly();
  readonly orders = this.ordersSignal.asReadonly();
  readonly meta = this.metaSignal.asReadonly();

  fetchOrders(query: AdminOrderQueryParams = {}): Observable<{ orders: AdminOrder[]; meta: AdminOrderListMeta }> {
    const params = this.buildParams(query);

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<AdminOrderListApiResponse | AdminOrder[]>(this.orderApiUrl, { params }).pipe(
      map((response) => this.normalizeOrderListResponse(response)),
      tap(({ orders, meta }) => {
        this.ordersSignal.set(orders);
        this.metaSignal.set(meta);
      }),
      catchError((error) => {
        this.errorSignal.set('Failed to load admin orders.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  fetchOrderById(id: number): Observable<AdminOrder> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<AdminOrderApiResponse | AdminOrder>(`${this.orderApiUrl}/${id}`).pipe(
      map((response) => this.normalizeOrder(response)),
      tap((order) => this.orderSignal.set(order)),
      catchError((error) => {
        this.errorSignal.set('Failed to load order details.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<AdminOrder> {
    this.updatingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<AdminOrderUpdateResponse | AdminOrder>(`${this.orderApiUrl}/${id}/status`, { status }).pipe(
      map((response) => this.normalizeOrder(response)),
      tap((order) => {
        this.orderSignal.set(order);
        this.ordersSignal.update((orders) => orders.map((item) => (item.id === order.id ? order : item)));
      }),
      catchError((error) => {
        this.errorSignal.set('Failed to update order status.');
        return throwError(() => error);
      }),
      finalize(() => this.updatingSignal.set(false))
    );
  }

  clearOrder(): void {
    this.orderSignal.set(null);
    this.errorSignal.set(null);
  }

  private buildParams(query: AdminOrderQueryParams): HttpParams {
    let params = new HttpParams();
    const entries = Object.entries(query) as Array<[keyof AdminOrderQueryParams, AdminOrderQueryParams[keyof AdminOrderQueryParams]]>;

    for (const [key, value] of entries) {
      if (value === undefined || value === null || value === '' || value === 'all') {
        continue;
      }

      params = params.set(key, String(value));
    }

    return params;
  }

  private normalizeOrderListResponse(response: AdminOrderListApiResponse | AdminOrder[]): { orders: AdminOrder[]; meta: AdminOrderListMeta } {
    if (Array.isArray(response)) {
      return { orders: response, meta: {} };
    }

    return {
      orders: response.data ?? response.orders ?? [],
      meta: response.meta ?? {}
    };
  }

  private normalizeOrder(response: AdminOrderApiResponse | AdminOrder | AdminOrderUpdateResponse): AdminOrder {
    if ('data' in response && response.data) {
      return response.data;
    }

    return response as AdminOrder;
  }
}
