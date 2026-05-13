import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminOrderService } from '../services/admin-order.service';
import { AdminOrder } from '../models/admin-order';
import { OrderStatus } from '../../orders/models/order';
import { ToastService } from '../../../core/toast/toast.service';

const ADMIN_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: []
};

@Component({
  selector: 'app-admin-order-detail-page',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-order-detail-page.html',
  styleUrl: './admin-order-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminOrderDetailPage {
  private readonly orderService = inject(AdminOrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  readonly order = signal<AdminOrder | null>(null);
  readonly loading = this.orderService.loading;
  readonly updating = this.orderService.updating;
  readonly error = this.orderService.error;
  readonly localError = signal<string | null>(null);
  readonly displayError = computed(() => this.localError() ?? this.error());
  readonly selectedStatus = signal<OrderStatus | null>(null);
  readonly confirming = signal(false);

  readonly availableTransitions = computed(() => {
    const current = this.order();
    if (!current) {
      return [] as OrderStatus[];
    }

    return ADMIN_STATUS_TRANSITIONS[current.status];
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      this.localError.set(null);

      if (!Number.isFinite(id)) {
        this.localError.set('Invalid order id.');
        return;
      }

      this.orderService.fetchOrderById(id).subscribe({
        next: (order) => {
          this.order.set(order);
          this.selectedStatus.set(order.status);
        },
        error: () => this.toastService.error('Failed to load order', 'Unable to load the selected order.')
      });
    });
  }

  updateStatus(): void {
    const currentOrder = this.order();
    const nextStatus = this.selectedStatus();

    if (!currentOrder || !nextStatus || nextStatus === currentOrder.status) {
      return;
    }

    const allowed = this.availableTransitions();
    if (!allowed.includes(nextStatus)) {
      this.toastService.error('Invalid status transition', `You cannot change ${currentOrder.status} to ${nextStatus}.`);
      return;
    }

    const confirmed = window.confirm(`Change order #${currentOrder.id} status from ${currentOrder.status} to ${nextStatus}?`);
    if (!confirmed) {
      this.selectedStatus.set(currentOrder.status);
      return;
    }

    const previous = currentOrder;
    this.order.set({ ...currentOrder, status: nextStatus });

    this.orderService.updateOrderStatus(currentOrder.id, nextStatus).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.selectedStatus.set(updated.status);
        this.toastService.success('Order updated', `Order #${updated.id} is now ${updated.status}.`);
      },
      error: () => {
        this.order.set(previous);
        this.selectedStatus.set(previous.status);
        this.toastService.error('Status update failed', 'The server rejected the change.');
      }
    });
  }
}
