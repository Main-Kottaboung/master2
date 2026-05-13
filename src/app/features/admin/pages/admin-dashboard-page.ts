import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminOrderService } from '../services/admin-order.service';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardPage {
  private readonly orderService = inject(AdminOrderService);
  private readonly toastService = inject(ToastService);

  readonly loading = this.orderService.loading;
  readonly error = this.orderService.error;
  readonly orders = signal(this.orderService.orders().slice(0, 5));

  constructor() {
    this.orderService.fetchOrders({ limit: 5, page: 1, sortBy: 'createdAt', sortDir: 'desc' }).subscribe({
      next: ({ orders }) => this.orders.set(orders.slice(0, 5)),
      error: () => this.toastService.error('Dashboard load failed', 'Unable to load recent orders.')
    });
  }
}
