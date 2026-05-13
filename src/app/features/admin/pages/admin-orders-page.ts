import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminOrderService } from '../services/admin-order.service';
import { AdminOrder, AdminOrderQueryParams } from '../models/admin-order';
import { OrderStatus } from '../../orders/models/order';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-admin-orders-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-orders-page.html',
  styleUrl: './admin-orders-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminOrdersPage {
  private readonly orderService = inject(AdminOrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  readonly statuses: Array<'all' | OrderStatus> = ['all', 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'];
  readonly sortFields: Array<NonNullable<AdminOrderQueryParams['sortBy']>> = ['createdAt', 'updatedAt', 'totalAmount', 'status'];

  readonly filtersForm = new FormGroup({
    q: new FormControl('', { nonNullable: true }),
    status: new FormControl<'all' | OrderStatus>('all', { nonNullable: true }),
    sortBy: new FormControl<NonNullable<AdminOrderQueryParams['sortBy']>>('createdAt', { nonNullable: true }),
    sortDir: new FormControl<'asc' | 'desc'>('desc', { nonNullable: true }),
    limit: new FormControl(10, { nonNullable: true })
  });

  readonly loading = this.orderService.loading;
  readonly error = this.orderService.error;
  readonly orders = signal<AdminOrder[]>([]);
  readonly meta = this.orderService.meta;
  readonly pageNumbers = computed(() => {
    const page = this.meta().page ?? 1;
    const totalPages = this.meta().pages ?? 1;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const pages: number[] = [];
    for (let current = start; current <= end; current++) {
      pages.push(current);
    }
    return pages;
  });

  constructor() {
    this.syncWithQueryParams();
  }

  applyFilters(): void {
    const value = this.filtersForm.getRawValue();
    this.navigateWithQuery({
      page: 1,
      q: value.q.trim() || null,
      status: value.status,
      sortBy: value.sortBy,
      sortDir: value.sortDir,
      limit: value.limit
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({ q: '', status: 'all', sortBy: 'createdAt', sortDir: 'desc', limit: 10 });
    this.navigateWithQuery({ page: 1, q: null, status: null, sortBy: 'createdAt', sortDir: 'desc', limit: 10 });
  }

  goToPage(page: number): void {
    const totalPages = this.meta().pages ?? 1;
    const current = this.meta().page ?? 1;
    if (page < 1 || page > totalPages || page === current) {
      return;
    }

    this.navigateWithQuery({ page });
  }

  private syncWithQueryParams(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const query = this.parseQueryParams(params);

      this.filtersForm.patchValue(
        {
          q: query.q ?? '',
          status: query.status ?? 'all',
          sortBy: query.sortBy ?? 'createdAt',
          sortDir: query.sortDir ?? 'desc',
          limit: query.limit ?? 10
        },
        { emitEvent: false }
      );

      this.loadOrders(query);
    });
  }

  private parseQueryParams(params: import('@angular/router').ParamMap): AdminOrderQueryParams {
    return {
      page: this.parseNumber(params.get('page'), 1),
      limit: this.parseNumber(params.get('limit'), 10),
      q: params.get('q') ?? undefined,
      status: (params.get('status') as AdminOrderQueryParams['status']) ?? 'all',
      sortBy: (params.get('sortBy') as AdminOrderQueryParams['sortBy']) ?? 'createdAt',
      sortDir: (params.get('sortDir') as AdminOrderQueryParams['sortDir']) ?? 'desc'
    };
  }

  private parseNumber(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private loadOrders(query: AdminOrderQueryParams): void {
    this.orderService.fetchOrders(query).subscribe({
      next: ({ orders }) => this.orders.set(orders),
      error: () => this.toastService.error('Failed to load orders', 'Try adjusting filters or refreshing the page.')
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

    this.router.navigate([], { relativeTo: this.route, queryParams: nextQuery });
  }
}
