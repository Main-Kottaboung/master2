import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPage {
  private readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);

  readonly actionItemId = signal<number | null>(null);

  readonly loading = this.cartService.loading;
  readonly mutating = this.cartService.mutating;
  readonly error = this.cartService.error;
  readonly items = this.cartService.items;
  readonly total = this.cartService.total;
  readonly totalQuantity = this.cartService.totalQuantity;
  readonly hasItems = this.cartService.hasItems;

  readonly isGuest = computed(() => !this.authService.isAuthenticated());

  constructor() {
    this.cartService.fetchCart().subscribe({ error: () => {} });
  }

  decrement(itemId: number, current: number): void {
    if (current <= 1 || this.mutating()) {
      return;
    }

    this.updateQuantity(itemId, current - 1);
  }

  increment(itemId: number, current: number): void {
    if (this.mutating()) {
      return;
    }

    this.updateQuantity(itemId, current + 1);
  }

  remove(itemId: number): void {
    if (this.mutating()) {
      return;
    }

    this.actionItemId.set(itemId);
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.actionItemId.set(null),
      error: () => this.actionItemId.set(null)
    });
  }

  private updateQuantity(itemId: number, quantity: number): void {
    this.actionItemId.set(itemId);
    this.cartService.updateItemQuantity(itemId, quantity).subscribe({
      next: () => this.actionItemId.set(null),
      error: () => this.actionItemId.set(null)
    });
  }
}
