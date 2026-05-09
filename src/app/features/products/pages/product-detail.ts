import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailPage implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  product: Product | undefined;
  notFound = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product = this.productService.getProductById(id);
      if (!this.product) {
        this.notFound = true;
      }
    }
  }

  addToCart() {
    if (this.product) {
      console.log('Add to cart:', this.product.id);
    }
  }
}
