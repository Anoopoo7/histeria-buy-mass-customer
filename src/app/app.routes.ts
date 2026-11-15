import { Routes } from '@angular/router';
import { customerAuthGuard } from './core/guards/auth.guard';
import { locationGuard } from './core/guards/location.guard';
import { CustomerShellComponent } from './layout/customer-shell/customer-shell.component';

export const routes: Routes = [
  // 1. Location Onboarding Route (First customer experience)
  {
    path: 'location',
    loadComponent: () =>
      import('./features/location/pages/location-page/location-page.component').then(
        (m) => m.LocationPageComponent,
      ),
  },

  // 2. Guest Authentication Flow
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterPageComponent,
          ),
      },
      {
        path: 'verify-phone',
        loadComponent: () =>
          import('./features/auth/pages/verify-phone/verify-phone.component').then(
            (m) => m.VerifyPhonePageComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // 3. Customer Shopping & Discovery App Shell
  {
    path: '',
    component: CustomerShellComponent,
    children: [
      {
        path: 'home',
        canActivate: [locationGuard],
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page.component').then(
            (m) => m.HomePageComponent,
          ),
      },
      {
        path: 'explore',
        canActivate: [locationGuard],
        loadComponent: () =>
          import('./features/explore/pages/explore-page/explore-page.component').then(
            (m) => m.ExplorePageComponent,
          ),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/pages/search-page/search-page.component').then(
            (m) => m.SearchPageComponent,
          ),
      },
      {
        path: 'stores',
        canActivate: [locationGuard],
        loadComponent: () =>
          import('./features/stores/pages/stores-page/stores-page.component').then(
            (m) => m.StoresPageComponent,
          ),
      },
      {
        path: 'stores/:storeId',
        loadComponent: () =>
          import('./features/stores/pages/store-detail-page/store-detail-page.component').then(
            (m) => m.StoreDetailPageComponent,
          ),
      },
      {
        path: 'products',
        canActivate: [locationGuard],
        loadComponent: () =>
          import('./features/products/pages/products-page/products-page.component').then(
            (m) => m.ProductsPageComponent,
          ),
      },
      {
        path: 'products/:productId',
        loadComponent: () =>
          import('./features/products/pages/product-detail-page/product-detail-page.component').then(
            (m) => m.ProductDetailPageComponent,
          ),
      },
      {
        path: 'pools',
        canActivate: [locationGuard],
        loadComponent: () =>
          import('./features/pools/pages/pools-page/pools-page.component').then(
            (m) => m.PoolsPageComponent,
          ),
      },
      {
        path: 'pools/:poolId',
        loadComponent: () =>
          import('./features/pools/pages/pool-detail-page/pool-detail-page.component').then(
            (m) => m.PoolDetailPageComponent,
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/pages/cart-page/cart-page.component').then(
            (m) => m.CartPageComponent,
          ),
      },
      {
        path: 'checkout/:storeId',
        canActivate: [customerAuthGuard],
        loadComponent: () =>
          import('./features/checkout/pages/checkout-page/checkout-page.component').then(
            (m) => m.CheckoutPageComponent,
          ),
      },
      {
        path: 'orders',
        canActivate: [customerAuthGuard],
        loadComponent: () =>
          import('./features/orders/pages/orders-page/orders-page.component').then(
            (m) => m.OrdersPageComponent,
          ),
      },
      {
        path: 'orders/:orderId',
        canActivate: [customerAuthGuard],
        loadComponent: () =>
          import('./features/orders/pages/order-detail-page/order-detail-page.component').then(
            (m) => m.OrderDetailPageComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings-page/settings-page.component').then(
            (m) => m.SettingsPageComponent,
          ),
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./features/addresses/pages/addresses-page/addresses-page.component').then(
            (m) => m.AddressesPageComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/pages/notifications-page/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./features/wishlist/pages/wishlist-page/wishlist-page.component').then(
            (m) => m.WishlistPageComponent,
          ),
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./features/help/pages/help-page/help-page.component').then(
            (m) => m.HelpPageComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'home',
  },
];
