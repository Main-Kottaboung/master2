export interface CartProductImageDto {
  id?: number;
  url?: string;
  altText?: string;
  sortOrder?: number;
}

export interface CartProductDto {
  id: number;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images?: CartProductImageDto[];
}

export interface CartItemDto {
  id: number;
  quantity: number;
  subtotal: number;
  product: CartProductDto;
}

export interface CartDto {
  id: number;
  userId: number;
  items: CartItemDto[];
  totalQuantity: number;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartApiResponse {
  data?: CartDto;
}

export interface CartProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  subtotal: number;
  product: CartProduct;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalQuantity: number;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
