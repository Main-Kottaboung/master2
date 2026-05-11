import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ProductApiDto,
  ProductDetail,
  ProductListApiEnvelope,
  ProductListApiResponse,
  ProductListResponse,
  ProductQueryParams,
  ProductSummary
} from '../models/product';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productApiUrl = `${environment.apiBaseUrl}/api/products`;

  getProducts(query: ProductQueryParams): Observable<ProductListResponse> {
    const params = this.buildQueryParams(query);

    return this.http
      .get<ProductListApiEnvelope | ProductListApiEnvelope[] | ProductListApiResponse | ProductApiDto[]>(this.productApiUrl, { params })
      .pipe(map((response) => this.normalizeProductListResponse(response, query.page ?? 1, query.limit ?? 12)));
  }

  getProductBySlug(slug: string): Observable<ProductDetail> {
    return this.http
      .get<ProductApiDto | { data?: ProductApiDto } | Array<ProductApiDto | { data?: ProductApiDto }>>(
        `${this.productApiUrl}/${encodeURIComponent(slug)}`
      )
      .pipe(map((response) => this.extractProductDto(response)), map((dto) => this.mapToProductDetail(dto)));
  }

  private buildQueryParams(query: ProductQueryParams): HttpParams {
    let params = new HttpParams();
    const entries = Object.entries(query) as Array<[keyof ProductQueryParams, ProductQueryParams[keyof ProductQueryParams]]>;

    for (const [key, value] of entries) {
      if (value === undefined || value === null || value === '') {
        continue;
      }

      params = params.set(key, String(value));
    }

    return params;
  }

  private normalizeProductListResponse(
    response: ProductListApiEnvelope | ProductListApiEnvelope[] | ProductListApiResponse | ProductApiDto[],
    fallbackPage: number,
    fallbackLimit: number
  ): ProductListResponse {
    if (Array.isArray(response) && response.length > 0 && this.isEnvelope(response[0])) {
      const envelope = response[0];
      const productsRaw = envelope.data ?? [];
      const products = productsRaw.map((item) => this.mapToProductSummary(item));

      const page = this.toPositiveNumber(envelope.meta?.page, fallbackPage);
      const limit = this.toPositiveNumber(envelope.meta?.limit, fallbackLimit);
      const total = this.toPositiveNumber(envelope.meta?.total, products.length);
      const totalPages = this.toPositiveNumber(envelope.meta?.pages, Math.max(1, Math.ceil(total / Math.max(limit, 1))));

      return {
        products,
        page,
        limit,
        total,
        totalPages
      };
    }

    if (Array.isArray(response)) {
      const products = response
        .filter((item): item is ProductApiDto => this.isProductApiDto(item))
        .map((item) => this.mapToProductSummary(item));
      const total = products.length;
      return {
        products,
        page: fallbackPage,
        limit: fallbackLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / fallbackLimit))
      };
    }

    if (this.isListApiResponse(response)) {
      const productsRaw = response.products ?? response.data ?? response.items ?? [];
      const products = productsRaw.map((item) => this.mapToProductSummary(item));

      const page = this.toPositiveNumber(response.page ?? response.meta?.page, fallbackPage);
      const limit = this.toPositiveNumber(response.limit ?? response.meta?.limit, fallbackLimit);
      const total = this.toPositiveNumber(response.total ?? response.meta?.total, products.length);
      const totalPages =
        this.toPositiveNumber(response.totalPages ?? response.meta?.totalPages, 0) ||
        this.toPositiveNumber(response.meta?.pages, 0) ||
        Math.max(1, Math.ceil(total / Math.max(limit, 1)));

      return {
        products,
        page,
        limit,
        total,
        totalPages
      };
    }

    const fallbackEnvelope = response as ProductListApiEnvelope;
    const products = (fallbackEnvelope.data ?? []).map((item) => this.mapToProductSummary(item));
    const page = this.toPositiveNumber(fallbackEnvelope.meta?.page, fallbackPage);
    const limit = this.toPositiveNumber(fallbackEnvelope.meta?.limit, fallbackLimit);
    const total = this.toPositiveNumber(fallbackEnvelope.meta?.total, products.length);
    const totalPages =
      this.toPositiveNumber(fallbackEnvelope.meta?.pages, 0) ||
      Math.max(1, Math.ceil(total / Math.max(limit, 1)));

    return {
      products,
      page,
      limit,
      total,
      totalPages
    };
  }

  private extractProductDto(
    response: ProductApiDto | { data?: ProductApiDto } | Array<ProductApiDto | { data?: ProductApiDto }>
  ): ProductApiDto {
    if (Array.isArray(response)) {
      const first = response[0];
      if (!first) {
        return {};
      }

      if (this.isWrappedProduct(first)) {
        return first.data ?? {};
      }

      return first;
    }

    if (this.isWrappedProduct(response)) {
      return response.data ?? {};
    }

    return response;
  }

  private isEnvelope(value: unknown): value is ProductListApiEnvelope {
    return !!value && typeof value === 'object' && ('data' in value || 'meta' in value);
  }

  private isListApiResponse(value: unknown): value is ProductListApiResponse {
    return (
      !!value &&
      typeof value === 'object' &&
      ('products' in value || 'items' in value || 'totalPages' in value || 'page' in value || 'limit' in value || 'total' in value)
    );
  }

  private isWrappedProduct(value: unknown): value is { data?: ProductApiDto } {
    return !!value && typeof value === 'object' && 'data' in value;
  }

  private isProductApiDto(value: unknown): value is ProductApiDto {
    return !!value && typeof value === 'object' && ('id' in value || 'title' in value || 'name' in value || 'slug' in value);
  }

  private toPositiveNumber(value: number | undefined, fallback: number): number {
    if (value === undefined || value === null) {
      return fallback;
    }

    return value > 0 ? value : fallback;
  }

  private mapToProductSummary(dto: ProductApiDto): ProductSummary {
    const categoryName = typeof dto.category === 'string'
      ? dto.category
      : (dto.category?.name ?? 'Uncategorized');

    const firstImage = dto.images?.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
    const image = dto.image ?? dto.imageUrl ?? dto.thumbnail ?? firstImage?.url ?? 'https://via.placeholder.com/640x480?text=Product';

    return {
      id: String(dto.id ?? ''),
      slug: dto.slug ?? String(dto.id ?? ''),
      name: dto.name ?? dto.title ?? 'Untitled Product',
      description: dto.description ?? dto.shortDescription ?? 'No description available.',
      price: Number(dto.price ?? 0),
      image,
      category: categoryName,
      inStock: dto.inStock ?? ((dto.stock ?? 0) > 0)
    };
  }

  private mapToProductDetail(dto: ProductApiDto): ProductDetail {
    const base = this.mapToProductSummary(dto);
    return {
      ...base,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }
}
