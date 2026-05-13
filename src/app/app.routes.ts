import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout';
import { ShopLayout } from './layouts/shop-layout';
import { AdminLayout } from './layouts/admin-layout';
import { LoginPage } from './features/auth/pages/login-page/login';
import { RegisterPage } from './features/auth/pages/register-page/register';
import { authGuard, guestGuard } from './features/auth/guards/auth.guard';
import { adminGuard, adminChildGuard } from './features/admin/guards/admin.guard';

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
      {
        path: '',
        loadComponent: () =>
          import('./features/products/pages/product-list').then((m) => m.ProductListPage)
      },
      {
        path: ':slug',
        loadComponent: () =>
          import('./features/products/pages/product-detail').then((m) => m.ProductDetailPage)
      }
    ]
  },
  {
    path: 'cart',
    component: ShopLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/cart/pages/cart-page').then((m) => m.CartPage)
      }
    ]
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    component: ShopLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/orders/pages/checkout-page').then((m) => m.CheckoutPage)
      }
    ]
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    component: ShopLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/orders/pages/orders-history-page').then((m) => m.OrdersHistoryPage)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/orders/pages/order-detail-page').then((m) => m.OrderDetailPage)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminChildGuard],
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/pages/admin-dashboard-page').then((m) => m.AdminDashboardPage)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/pages/admin-orders-page').then((m) => m.AdminOrdersPage)
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/admin/pages/admin-order-detail-page').then((m) => m.AdminOrderDetailPage)
      }
    ]
  },
  { path: '**', redirectTo: 'shop' }
];
