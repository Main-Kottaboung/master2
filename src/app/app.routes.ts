import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout';
import { ShopLayout } from './layouts/shop-layout';
import { AdminLayout } from './layouts/admin-layout';
import { ProductListPage } from './features/products/pages/product-list';
import { ProductDetailPage } from './features/products/pages/product-detail';
import { LoginPage } from './features/auth/pages/login-page/login';
import { RegisterPage } from './features/auth/pages/register-page/register';
import { authGuard, guestGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', canActivate: [guestGuard], component: LoginPage },
      { path: 'register', canActivate: [guestGuard], component: RegisterPage }
    ]
  },
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
    canActivate: [authGuard],
    data: { role: 'admin' },
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
