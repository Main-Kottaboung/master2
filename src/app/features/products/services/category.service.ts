import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CategoryApiDto, CategoryApiResponse, ProductCategory } from '../models/product';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoryApiUrl = `${environment.apiBaseUrl}/api/categories`;

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<CategoryApiResponse | CategoryApiDto[]>(this.categoryApiUrl).pipe(
      map((response) => {
        const list = Array.isArray(response)
          ? response
          : response.categories ?? response.data ?? [];

        return list
          .map((dto) => this.mapCategory(dto))
          .filter((category) => category.name.length > 0);
      })
    );
  }

  private mapCategory(dto: CategoryApiDto): ProductCategory {
    return {
      id: String(dto.id ?? dto.slug ?? dto.name ?? ''),
      name: dto.name ?? '',
      slug: dto.slug
    };
  }
}
