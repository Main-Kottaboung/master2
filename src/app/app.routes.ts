import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout';
import { ShopLayout } from './layouts/shop-layout';
import { AdminLayout } from './layouts/admin-layout';
import { ProductListPage } from './features/products/pages/product-list';
import { ProductDetailPage } from './features/products/pages/product-detail';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: 'shop', pathMatch: 'full' },
      { path: 'home', component: PublicLayout }
    ]
  },
  {
    path: 'shop',
    component: ShopLayout,
    children: [
      { path: '', component: ProductListPage },
      { path: ':id', component: ProductDetailPage }
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PublicLayout },
      { path: 'products', component: PublicLayout },
      { path: 'orders', component: PublicLayout },
      { path: 'customers', component: PublicLayout }
    ]
  },
  { path: '**', redirectTo: 'shop' }
];
