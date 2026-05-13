import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order';

@Component({
  selector: 'app-order-detail-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail-page.html',
  styleUrl: './order-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailPage {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<Order | null>(null);
  readonly loading = this.orderService.loading;
  readonly error = this.orderService.error;
  readonly success = signal(false);
  readonly localError = signal<string | null>(null);
  readonly displayError = computed(() => this.localError() ?? this.error());

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      this.success.set(this.route.snapshot.queryParamMap.get('placed') === '1');

      if (!Number.isFinite(id)) {
        this.localError.set('Invalid order id.');
        return;
      }

      this.localError.set(null);

      this.orderService.fetchOrderById(id).subscribe({
        next: (order) => this.order.set(order),
        error: () => {}
      });
    });
  }
}
