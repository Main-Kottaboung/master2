import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, finalize, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import {
  AddCartItemRequest,
  Cart,
  CartApiResponse,
  CartDto,
  CartItem,
  UpdateCartItemRequest
} from '../models/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly cartApiUrl = `${environment.apiBaseUrl}/api/cart`;

  private readonly cartSignal = signal<Cart | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly mutatingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly cart = this.cartSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly mutating = this.mutatingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly items = computed(() => this.cartSignal()?.items ?? []);
  readonly total = computed(() => this.cartSignal()?.total ?? 0);
  readonly totalQuantity = computed(() => this.cartSignal()?.totalQuantity ?? 0);
  readonly itemCount = computed(() => this.cartSignal()?.itemCount ?? 0);
  readonly hasItems = computed(() => this.items().length > 0);

  constructor() {
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      if (!isAuthenticated) {
        this.resetCart();
        return;
      }

      this.fetchCart().subscribe();
    });
  }

  fetchCart(): Observable<Cart> {
    if (!this.authService.isAuthenticated()) {
      this.resetCart();
      return EMPTY;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<CartApiResponse>(this.cartApiUrl).pipe(
      map((response) => this.normalizeCart(response?.data)),
      tap((cart) => this.cartSignal.set(cart)),
      catchError((error) => {
        this.errorSignal.set('Failed to load your cart.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  addItem(productId: number, quantity: number): Observable<Cart> {
    if (!this.authService.isAuthenticated()) {
      this.errorSignal.set('Please sign in to add items to cart.');
      return throwError(() => new Error('Not authenticated'));
    }

    const body: AddCartItemRequest = {
      productId,
      quantity
    };

    this.mutatingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<CartApiResponse>(`${this.cartApiUrl}/items`, body).pipe(
      map((response) => this.normalizeCart(response?.data)),
      tap((cart) => this.cartSignal.set(cart)),
      catchError((error) => {
        this.errorSignal.set('Failed to add item to cart.');
        return throwError(() => error);
      }),
      finalize(() => this.mutatingSignal.set(false))
    );
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<Cart> {
    const safeQuantity = Math.max(1, quantity);
    const body: UpdateCartItemRequest = { quantity: safeQuantity };

    this.mutatingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<CartApiResponse>(`${this.cartApiUrl}/items/${itemId}`, body).pipe(
      map((response) => this.normalizeCart(response?.data)),
      tap((cart) => this.cartSignal.set(cart)),
      catchError((error) => {
        this.errorSignal.set('Failed to update item quantity.');
        return throwError(() => error);
      }),
      finalize(() => this.mutatingSignal.set(false))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    this.mutatingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<CartApiResponse>(`${this.cartApiUrl}/items/${itemId}`).pipe(
      map((response) => this.normalizeCart(response?.data)),
      tap((cart) => this.cartSignal.set(cart)),
      catchError((error) => {
        this.errorSignal.set('Failed to remove item from cart.');
        return throwError(() => error);
      }),
      finalize(() => this.mutatingSignal.set(false))
    );
  }

  private resetCart(): void {
    this.cartSignal.set(null);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
    this.mutatingSignal.set(false);
  }

  private normalizeCart(cart: CartDto | undefined): Cart {
    const source = cart ?? {
      id: 0,
      userId: 0,
      items: [],
      totalQuantity: 0,
      total: 0,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const items: CartItem[] = source.items.map((item) => {
      const firstImage = item.product.images?.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
      return {
        id: item.id,
        quantity: item.quantity,
        subtotal: item.subtotal,
        product: {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          price: item.product.price,
          stock: item.product.stock,
          imageUrl: firstImage?.url ?? 'https://via.placeholder.com/320x240?text=Product'
        }
      };
    });

    return {
      id: source.id,
      userId: source.userId,
      items,
      totalQuantity: source.totalQuantity,
      total: source.total,
      itemCount: source.itemCount,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt
    };
  }
}
