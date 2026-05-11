import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { ProductCard } from '../components/product-card';
import { ProductCategory, ProductListResponse, ProductQueryParams, ProductSummary } from '../models/product';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ReactiveFormsModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListPage {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly filtersForm = new FormGroup({
    q: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    minPrice: new FormControl<number | null>(null),
    maxPrice: new FormControl<number | null>(null),
    limit: new FormControl(12, { nonNullable: true })
  });

  readonly products = signal<ProductSummary[]>([]);
  readonly categories = signal<ProductCategory[]>([]);
  readonly loading = signal(true);
  readonly categoryLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly pagination = signal({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

  readonly pageNumbers = computed(() => {
    const { page, totalPages } = this.pagination();
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const pages: number[] = [];
    for (let current = start; current <= end; current++) {
      pages.push(current);
    }
    return pages;
  });

  constructor() {
    this.loadCategories();
    this.syncWithQueryParams();
  }

  onApplyFilters(): void {
    const formValue = this.filtersForm.getRawValue();
    this.navigateWithQuery({
      page: 1,
      limit: formValue.limit,
      q: formValue.q.trim() || null,
      category: formValue.category || null,
      minPrice: formValue.minPrice,
      maxPrice: formValue.maxPrice
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({
      q: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      limit: 12
    });

    this.navigateWithQuery({
      page: 1,
      limit: 12,
      q: null,
      category: null,
      minPrice: null,
      maxPrice: null
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pagination().totalPages || page === this.pagination().page) {
      return;
    }

    this.navigateWithQuery({ page });
  }

  quickSelectCategory(slugOrName: string): void {
    this.filtersForm.patchValue({ category: slugOrName });
    this.onApplyFilters();
  }

  private syncWithQueryParams(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const query = this.parseQueryParams(params);

        this.filtersForm.patchValue(
          {
            q: query.q ?? '',
            category: query.category ?? '',
            minPrice: query.minPrice ?? null,
            maxPrice: query.maxPrice ?? null,
            limit: query.limit ?? 12
          },
          { emitEvent: false }
        );

        this.loadProducts(query);
      });
  }

  private parseQueryParams(params: import('@angular/router').ParamMap): ProductQueryParams {
    return {
      page: this.parseNumber(params.get('page'), 1),
      limit: this.parseNumber(params.get('limit'), 12),
      q: params.get('q') ?? undefined,
      category: params.get('category') ?? undefined,
      minPrice: this.parseOptionalNumber(params.get('minPrice')),
      maxPrice: this.parseOptionalNumber(params.get('maxPrice'))
    };
  }

  private parseNumber(raw: string | null, fallback: number): number {
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private parseOptionalNumber(raw: string | null): number | undefined {
    if (!raw) {
      return undefined;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  }

  private loadProducts(query: ProductQueryParams): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts(query).subscribe({
      next: (response: ProductListResponse) => {
        this.products.set(response.products);
        this.pagination.set({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products. Please try again.');
        this.products.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadCategories(): void {
    this.categoryLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoryLoading.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.categoryLoading.set(false);
      }
    });
  }

  private navigateWithQuery(updates: Record<string, string | number | null | undefined>): void {
    const nextQuery: Record<string, string | number> = {
      ...this.route.snapshot.queryParams
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === '') {
        delete nextQuery[key];
      } else {
        nextQuery[key] = value;
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: nextQuery
    });
  }
}
