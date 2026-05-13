import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-orders-history-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders-history-page.html',
  styleUrl: './orders-history-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersHistoryPage {
  private readonly orderService = inject(OrderService);

  readonly loading = this.orderService.loading;
  readonly error = this.orderService.error;
  readonly orders = this.orderService.orders;

  constructor() {
    this.orderService.fetchOrders().subscribe({ error: () => {} });
  }
}
