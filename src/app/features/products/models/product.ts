export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface ProductDetail extends ProductSummary {
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductListResponse {
  products: ProductSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListApiResponse {
  products?: ProductApiDto[];
  data?: ProductApiDto[];
  items?: ProductApiDto[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
    totalPages?: number;
  };
}

export interface ProductListApiEnvelope {
  data?: ProductApiDto[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

export interface CategoryApiResponse {
  categories?: CategoryApiDto[];
  data?: CategoryApiDto[];
}

export interface ProductApiDto {
  id?: string | number;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  price?: number | string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  category?: string | { id?: string | number; name?: string; slug?: string };
  images?: Array<{ id?: string | number; url?: string; altText?: string; sortOrder?: number }>;
  inStock?: boolean;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryApiDto {
  id?: string | number;
  name?: string;
  slug?: string;
}
