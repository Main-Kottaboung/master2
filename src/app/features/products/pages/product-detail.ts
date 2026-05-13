import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../services/product.service';
import { ProductDetail } from '../models/product';
import { CartService } from '../../cart/services/cart.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPage {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<ProductDetail | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);
  readonly addCartMessage = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const slug = params.get('slug');
        if (!slug) {
          this.notFound.set(true);
          this.loading.set(false);
          return;
        }

        this.fetchProduct(slug);
      });
  }

  private fetchProduct(slug: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.error.set(null);

    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.quantity.set(1);
        this.loading.set(false);
      },
      error: (error) => {
        if (error?.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set('Failed to load product details. Please try again.');
        }

        this.loading.set(false);
      }
    });
  }

  decreaseQuantity(): void {
    this.quantity.update((current) => Math.max(1, current - 1));
  }

  increaseQuantity(): void {
    const max = this.product()?.stock ?? Number.MAX_SAFE_INTEGER;
    this.quantity.update((current) => Math.min(max, current + 1));
  }

  addToCart(): void {
    const currentProduct = this.product();
    if (!currentProduct || this.addingToCart()) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const productId = Number(currentProduct.id);
    if (!Number.isFinite(productId)) {
      this.addCartMessage.set('Unable to add this item to cart.');
      return;
    }

    this.addCartMessage.set(null);
    this.addingToCart.set(true);

    this.cartService.addItem(productId, this.quantity()).subscribe({
      next: () => {
        this.addCartMessage.set('Added to cart');
        this.addingToCart.set(false);
      },
      error: () => {
        this.addCartMessage.set(this.cartService.error() ?? 'Failed to add to cart.');
        this.addingToCart.set(false);
      }
    });
  }
}
