export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItemSnapshotImage {
  id?: number;
  url?: string;
  altText?: string;
  sortOrder?: number;
}

export interface OrderItemProductSnapshot {
  id?: number;
  title: string;
  slug?: string;
  price?: number;
  images?: OrderItemSnapshotImage[];
}

export interface OrderItem {
  id: number;
  productId: number;
  snapshotTitle: string;
  snapshotPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  totalQuantity: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderApiResponse {
  data?: Order;
}

export interface OrderListApiResponse {
  data?: Order[];
  orders?: Order[];
}

export interface OrderCreateResponse {
  data?: Order;
}

export interface CreateOrderRequest {
  note?: string;
}
