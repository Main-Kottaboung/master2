import { OrderStatus } from '../../orders/models/order';

export interface AdminOrderCustomerSnapshot {
  id?: number;
  name?: string;
  email?: string;
}

export interface AdminOrderItemSnapshotImage {
  id?: number;
  url?: string;
  altText?: string;
  sortOrder?: number;
}

export interface AdminOrderItemSnapshot {
  id?: number;
  title?: string;
  slug?: string;
  price?: number;
  images?: AdminOrderItemSnapshotImage[];
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  snapshotTitle: string;
  snapshotPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
  product?: AdminOrderItemSnapshot;
}

export interface AdminOrderStatusHistoryItem {
  id?: number;
  status: OrderStatus;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

export interface AdminOrder {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  totalQuantity: number;
  items: AdminOrderItem[];
  customer?: AdminOrderCustomerSnapshot;
  statusHistory?: AdminOrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderListMeta {
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
}

export interface AdminOrderApiResponse {
  data?: AdminOrder;
}

export interface AdminOrderListApiResponse {
  data?: AdminOrder[];
  orders?: AdminOrder[];
  meta?: AdminOrderListMeta;
}

export interface AdminOrderUpdateResponse {
  data?: AdminOrder;
}

export interface AdminOrderQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: OrderStatus | 'all';
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'status';
  sortDir?: 'asc' | 'desc';
}
