import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../cart/services/cart.service';
import { AuthService } from '../../auth/services/auth.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutPage {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cart = this.cartService.cart;
  readonly items = this.cartService.items;
  readonly loading = this.cartService.loading;
  readonly placingOrder = this.orderService.loading;
  readonly error = this.orderService.error;
  readonly cartError = this.cartService.error;
  readonly hasItems = this.cartService.hasItems;
  readonly total = this.cartService.total;
  readonly totalQuantity = this.cartService.totalQuantity;
  readonly successMessage = signal<string | null>(null);
  readonly isGuest = computed(() => !this.authService.isAuthenticated());

  constructor() {
    this.cartService.fetchCart().subscribe({ error: () => {} });
  }

  placeOrder(): void {
    if (!this.hasItems() || this.placingOrder()) {
      return;
    }

    this.successMessage.set(null);

    this.orderService.createOrder().subscribe({
      next: (order) => {
        this.successMessage.set('Order placed successfully.');
        this.router.navigate(['/orders', order.id], { queryParams: { placed: 1 } });
      },
      error: () => {
        this.successMessage.set(null);
      }
    });
  }
}
