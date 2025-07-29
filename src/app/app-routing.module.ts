import {NgModule} from '@angular/core';
import {Router, RouterModule, Routes} from '@angular/router';
import {userAuthStateGuard} from './auth-guard/user-auth-state.guard';
import {CustomPreloadingStrategy} from './core/utils/custom-preloading.strategy';
import {PendingReviewComponent} from './pages/pending-review/pending-review.component';
import {userAuthGuard} from './auth-guard/user-auth.guard';
import {AppConfigService} from './services/core/app-config.service';
import {PageViewSetting} from './interfaces/common/setting.interface';

const baseRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    data: {preloadAfter: null},
  },
  // {
  //   path: 'login',
  //   loadChildren: () =>
  //     import('./pages/login/login.module').then((m) => m.LoginModule),
  //   data: {preloadAfter: ['/']},
  //   canActivate: [userAuthStateGuard],
  // },

  // {
  //   path: 'login',
  //   loadComponent: ()=> import('./pages/login/login.component').then((m)=> m.LoginComponent),
  //   data: {preloadAfter: ['/']},
  //   canActivate: [userAuthStateGuard],
  // },
  // {
  //   path: 'signup',
  //   loadComponent: ()=> import('./pages/login/login.component').then((m)=> m.LoginComponent),
  //   data: {preloadAfter: ['/']},
  //   canActivate: [userAuthStateGuard],
  // },
  {
    path: 'login',
    loadComponent: () => import('./pages/user-auth/login/login.component').then((m) => m.LoginComponent),
    data: {preloadAfter: ['/']},
    canActivate: [userAuthStateGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/user-auth/sign-up/sign-up.component').then((m) => m.SignUpComponent),
    data: {preloadAfter: ['/']},
    canActivate: [userAuthStateGuard],
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
    data: {preloadAfter: ['/']},
  },
  {
    path: 'product-details/:slug',
    loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent),
    data: {preloadAfter: ['/'], urlType: 'website.com/product-details/test-product'},
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent),
    data: {preloadAfter: ['/'], urlType: 'website.com/products/test-product'},
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
    data: {preloadAfter: ['/']},
  },
  {
    path: 'product-categories',
    loadComponent: () =>
      import('./pages/product-categories/product-categories.component').then(
        (m) => m.ProductCategoriesComponent
      ),
  },
  {
    path: 'my-wishlist',
    loadComponent: () =>
      import('./pages/users/my-wishlist/my-wishlist.component').then((m) => m.MyWishlistComponent),
    canActivate: [userAuthGuard],
  },
  {
    path: 'order-tracking',
    loadComponent: () =>
      import('./pages/order-tracking/order-tracking.component').then(
        (m) => m.OrderTrackingComponent
      ),
    canActivate: [userAuthGuard],
  },
  // {
  //   path: 'order-tracking',
  //   loadComponent: () =>
  //     import('./pages/track-your-order/track-your-order.component').then(
  //       (m) => m.TrackYourOrderComponent
  //     ),
  // },
  {
    path: 'order-details/:id',
    loadComponent: () =>
      import('./pages/order-details/order-details.component').then(
        (m) => m.OrderDetailsComponent
      ),
  },
  {
    path: 'blog-details/:slug',
    loadComponent: () =>
      import('./pages/blog-details/blog-details.component').then(
        (m) => m.BlogDetailsComponent
      ),
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./pages/blogs/blogs.component').then(
        (m) => m.BlogsComponent
      ),
  },
  // {
  //   path: 'track-order-details/:id',
  //   loadComponent: () =>
  //     import('./pages/track-order-details/track-order-details.component').then(
  //       (m) => m.TrackOrderDetailsComponent
  //     ),
  // },
  // {
  //   path: 'track-order-list',
  //   loadComponent: () =>
  //     import('./pages/track-order-list/track-order-list.component').then(
  //       (m) => m.TrackOrderListComponent
  //     ),
  // },
  {
    path: 'success-order',
    loadComponent: () =>
      import('./pages/success-order/success-order.component').then(
        (m) => m.SuccessOrderComponent
      ),
  },
  {
    path: 'failed-order',
    loadComponent: () =>
      import('./pages/success-order/success-order.component').then(
        (m) => m.SuccessOrderComponent
      ),
  },
  {
    path: 'my-order-list',
    loadComponent: () =>
      import('./pages/order-list/order-list.component').then(
        (m) => m.OrderListComponent
      ),
    canActivate: [userAuthGuard],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search-page/search-page.component').then(
        (m) => m.SearchPageComponent
      ),
  },
  {
    path: 'invoice/:id',
    loadComponent: () =>
      import('./pages/print/invoice/invoice.component').then(
        (m) => m.InvoiceComponent
      ),
  },
  {
    path: 'my-account-sm',
    loadComponent: () =>
      import('./shared/components/account-menu-sm/account-menu-sm.component').then(
        (m) => m.AccountMenuSmComponent
      ),
    canActivate: [userAuthGuard],
  },
  {
    path: 'my-account',
    loadComponent: () =>
      import('./pages/users/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [userAuthGuard],
  },
  {
    path: 'my-review',
    loadComponent: () =>
      import('./pages/users/my-review/my-review.component').then(
        (m) => m.MyReviewComponent
      ),
  },
  {
    path: 'my-address',
    loadComponent: () =>
      import('./pages/users/my-address/my-address.component').then(
        (m) => m.MyAddressComponent
      ),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('../app/pages/users/edit-profile/edit-profile.component').then(
        (m) => m.EditProfileComponent
      ),
    canActivate: [userAuthGuard],
  },
  {
    path: 'pages/:pageSlug',
    loadComponent: () =>
      import(
        './pages/additional-page-view/additional-page-view.component'
        ).then((m) => m.AdditionalPageViewComponent),
    data: {preload: false, delay: false},
  },
  {
    path: 'setting',
    loadComponent: () =>
      import('./pages/users/setting/setting.component').then(
        (m) => m.SettingComponent
      ),
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./pages/forget-password/forget-password.component').then((m) => m.ForgetPasswordComponent),
  },
  {
    path: 'add-review',
    loadComponent: () =>
      import('./pages/add-review/add-review.component').then((m) => m.AddReviewComponent),
  },
  {
    path: 'edit-review/:id',
    loadComponent: () =>
      import('./pages/add-review/add-review.component').then((m) => m.AddReviewComponent),
  },
  {
    path: 'pending-review',
    component: PendingReviewComponent
  },
  {
    path: 'settings-security',
    loadComponent: () =>
      import('./pages/settings-security/settings-security.component').then(
        (m) => m.SettingsSecurityComponent
      ),
  },
  {
    path: 'test',
    loadComponent: () =>
      import('../app/pages/test/test.component').then(
        (m) => m.TestComponent
      ),
  },
  {
    path: 'compare-list',
    loadComponent: () => import('./pages/compare-list/compare-list.component').then((m) => m.CompareListComponent)
  },
  {
    path: 'all-reviews',
    loadComponent: () =>
      import('./pages/all-reviews/all-reviews.component').then((m) => m.AllReviewsComponent),
  },
  {
    path: 'brands',
    loadComponent: () => import('./pages/all-brands/all-brands.component').then(m => m.AllBrandsComponent),
    data: {preloadAfter: ['/'], urlType: 'website.com/product-details/test-product'},
  },
  // {
  //   path: 'offer/:slug',
  //   loadComponent: () =>
  //     import('../app/pages/offer/offer.component').then(
  //       (m) => m.OfferComponent
  //     ),
  // },
  {
    path: 'landing-page/:slug',
    loadComponent: () =>
      import('../app/pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: 'offer/:slug',
    loadComponent: () =>
      import('../app/pages/landing-page2/landing-page2.component').then(
        (m) => m.LandingPage2Component
      ),
  },
  // {
  //   path: '**',
  //   redirectTo: '',
  // },
];


const wildcardRoute: Routes = [
  {
    path: '**',
    redirectTo: '',
  },
];



@NgModule({
  imports: [
    RouterModule.forRoot(baseRoutes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      preloadingStrategy: CustomPreloadingStrategy,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(
    private appConfigService: AppConfigService,
    private router: Router
  ) {
    this.listenForConfigChanges();
  }

  private listenForConfigChanges() {
    this.appConfigService.config$.subscribe((config) => {
      if (config) {
        this.updateDynamicRoutes(config);
      }
    });
  }

  private updateDynamicRoutes(config: any) {
    const pageViewSettings: PageViewSetting[] = config.pageViewSettings ?? [];
    const pageOpt = pageViewSettings.find((f) => f.type === 'checkout');

    const dynamicRoutes: Routes = [
      {
        path: 'checkout',
        loadComponent: () => {
          return pageOpt?.name === 'Checkout 1'
            ? import('./pages/checkouts/checkout-1/checkout-1.component').then(
              (m) => m.Checkout1Component
            )
            : import('./pages/checkouts/checkout-2/checkout-2.component').then(
              (m) => m.Checkout2Component
            );
        },
        data: {preloadAfter: ['/']},
        canActivate: pageOpt?.isLoginRequire ? [userAuthGuard] : [],
      },
    ];

    this.router.resetConfig([
      ...baseRoutes,
      ...dynamicRoutes,
      {
        path: ':slug',
        loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent),
        data: {preloadAfter: ['/'], urlType: 'website.com/test-product'},
      },
      ...wildcardRoute,

    ]);
    // console.log('✅ Dynamic routes updated:', this.router.config);
  }
}
