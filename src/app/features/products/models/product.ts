export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  sku: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
}
