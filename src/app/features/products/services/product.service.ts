import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ProductResponse } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';

  // Signals for reactive state
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadMockProducts();
  }

  private loadMockProducts() {
    // Mock data for development
    this.products.set([
      {
        id: '1',
        name: 'Premium Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        image: 'https://via.placeholder.com/300x200?text=Headphones',
        category: 'Electronics',
        rating: 4.5,
        reviews: 128,
        inStock: true,
        sku: 'HP-001'
      },
      {
        id: '2',
        name: 'Wireless Keyboard',
        description: 'Ergonomic wireless keyboard for comfortable typing',
        price: 79.99,
        image: 'https://via.placeholder.com/300x200?text=Keyboard',
        category: 'Electronics',
        rating: 4.2,
        reviews: 94,
        inStock: true,
        sku: 'KB-001'
      },
      {
        id: '3',
        name: 'USB-C Hub',
        description: 'Multi-port USB-C hub with 7 ports',
        price: 49.99,
        image: 'https://via.placeholder.com/300x200?text=Hub',
        category: 'Accessories',
        rating: 4.7,
        reviews: 203,
        inStock: true,
        sku: 'HUB-001'
      },
      {
        id: '4',
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand',
        price: 39.99,
        image: 'https://via.placeholder.com/300x200?text=Stand',
        category: 'Accessories',
        rating: 4.4,
        reviews: 156,
        inStock: false,
        sku: 'STAND-001'
      },
      {
        id: '5',
        name: 'Mechanical Mouse',
        description: 'Precision gaming mouse with customizable buttons',
        price: 89.99,
        image: 'https://via.placeholder.com/300x200?text=Mouse',
        category: 'Electronics',
        rating: 4.6,
        reviews: 312,
        inStock: true,
        sku: 'MOUSE-001'
      },
      {
        id: '6',
        name: 'Monitor Arm',
        description: 'Full-motion monitor arm for dual screens',
        price: 59.99,
        image: 'https://via.placeholder.com/300x200?text=Arm',
        category: 'Accessories',
        rating: 4.3,
        reviews: 89,
        inStock: true,
        sku: 'ARM-001'
      }
    ]);
  }

  getProducts() {
    return this.products();
  }

  getProductById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  searchProducts(query: string): Product[] {
    const q = query.toLowerCase();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  getProductsByCategory(category: string): Product[] {
    return this.products().filter(p => p.category === category);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.products().map(p => p.category)));
  }
}
