import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../services/product.service';
import { ProductDetail } from '../models/product';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPage {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<ProductDetail | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);

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
}
