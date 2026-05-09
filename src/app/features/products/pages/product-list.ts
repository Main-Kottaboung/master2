import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ProductCard } from '../components/product-card';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListPage implements OnInit {
  private productService = inject(ProductService);

  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);

  products = computed(() => {
    let items = this.productService.getProducts();

    if (this.searchQuery()) {
      items = items.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    if (this.selectedCategory()) {
      items = items.filter(p => p.category === this.selectedCategory());
    }

    return items;
  });

  categories = computed(() => this.productService.getCategories());

  ngOnInit() {
    // Simulate loading state
    setTimeout(() => {
      // data loaded
    }, 300);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
  }
}
