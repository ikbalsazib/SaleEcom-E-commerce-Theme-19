import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Subscription} from 'rxjs';
import {Category} from '../../interfaces/common/category.interface';
import {CategoryService} from '../../services/common/category.service';
import {FilterData} from '../../interfaces/core/filter-data';
import {Pagination} from '../../interfaces/core/pagination';
import {Product, ProductFilterGroup} from '../../interfaces/common/product.interface';
import {ProductService} from '../../services/common/product.service';
import {AppConfigService} from '../../services/core/app-config.service';
import {Router, RouterLink} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';
import {CanonicalService} from '../../services/core/canonical.service';
import {ThemeViewSetting} from '../../interfaces/common/setting.interface';
import {isPlatformBrowser} from "@angular/common";
import {CategoriesCardComponent} from "../../shared/components/categories-card/categories-card.component";
import {CategoryLoaderComponent} from "../../shared/loader/category-loader/category-loader.component";
import {EmptyDataComponent} from "../../shared/components/ui/empty-data/empty-data.component";
import {ProductCard1Component} from "../../shared/components/product-cards/product-card-1/product-card-1.component";
import {ProductCard2Component} from "../../shared/components/product-cards/product-card-2/product-card-2.component";
import {ProductCardLoaderComponent} from "../../shared/loader/product-card-loader/product-card-loader.component";
import {CategoryCard2Component} from "../../shared/components/category-card-2/category-card-2.component";
import {ProductCard3Component} from "../../shared/components/product-cards/product-card-3/product-card-3.component";
import {CategoriesCard3Component} from '../../shared/components/category-card-3/categories-card-3.component';
import {ProductCard4Component} from '../../shared/components/product-cards/product-card-4/product-card-4.component';
import {SeoPageService} from "../../services/common/seo-page.service";
import {CategoryCard4Component} from "../../shared/components/category-card-4/category-card-4.component";

@Component({
  selector: 'app-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrl: './product-categories.component.scss',
  standalone: true,
  imports: [
    CategoriesCardComponent,
    CategoryLoaderComponent,
    EmptyDataComponent,
    ProductCard1Component,
    ProductCard2Component,
    ProductCardLoaderComponent,
    RouterLink,
    CategoryCard2Component,
    ProductCard3Component,
    CategoriesCard3Component,
    ProductCard4Component,
    CategoryCard4Component,
  ]
})
export class ProductCategoriesComponent implements OnInit, OnDestroy {

  // Store Data
  productCardViews: string = '';
  categoryCardViews: string = '';
  products: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  isLoadMore = false;
  productFilterGroup!: ProductFilterGroup;
  seoPageData: any;
  themeColors: any;

  // Filter Data
  filter: any = null;
  sortQuery = { createdAt: -1 };

  // Pagination
  currentPage = 1;
  totalProducts = 0;
  productsPerPage = 6;
  totalProductsStore = 0;

  // Inject
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly canonicalService = inject(CanonicalService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly seoPageService = inject(SeoPageService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getSettingData();
    this.getAllCategory();
    this.getAllProducts();
    if (isPlatformBrowser(this.platformId)) {
      this.updateMetaData();
    }
    this.getAllSeoPage();
  }

  /**
   * Fetch Theme Settings
   */
  private getSettingData(): void {
    const themeViewSettings: ThemeViewSetting[] = this.appConfigService.getSettingData('themeViewSettings');
    this.productCardViews = themeViewSettings.find(f => f.type === 'productCardViews')?.value.join() || '';
    this.categoryCardViews = themeViewSettings.find(f => f.type === 'categoryViews')?.value.join() || '';
  }

  /**
   * Fetch Categories
   */
  private getAllCategory(loadMore?: boolean): void {
    const subscription = this.categoryService.getAllCategory().subscribe({
      next: res => {
        this.isLoadMore = false;
        this.isLoading = false;
        this.categories = loadMore ? [...this.categories, ...res.data] : res.data;
      },
      error: () => this.isLoading = false
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * Fetch Products
   */
  private getAllProducts(loadMore?: boolean): void {
    const pagination: Pagination = {
      pageSize: this.productsPerPage,
      currentPage: this.currentPage - 1
    };

    const filterData: FilterData = {
      filter: { ...this.filter, status: 'publish' },
      filterGroup: loadMore ? null : { isGroup: true, category: true, subCategory: true, brand: true },
      select: {
        name: 1,
        isVariation: 1,
        images: 1,
        prices: 1,
        tags: 1,
        slug: 1,
        category: 1,
        subCategory: 1,
        brand: 1,
        costPrice: 1,
        salePrice: 1,
        totalSold: 1,
        variation: 1,
        variation2: 1,
        discountType: 1,
        variationOptions: 1,
        variation2Options: 1,
        variationList: 1,
        discountAmount: 1,
        minimumWholesaleQuantity: 1,
        wholesalePrice: 1,
      },
      sort: this.sortQuery
    };

    const subscription = this.productService.getAllProducts(filterData, null).subscribe({
      next: res => {
        this.isLoading = false;
        this.isLoadMore = false;
        this.products = loadMore ? [...this.products, ...res.data] : res.data;
        this.totalProducts = res.count;
        if (!loadMore && !this.productFilterGroup) this.productFilterGroup = res.filterGroup;
      },
      error: () => this.isLoading = false
    });
    this.subscriptions?.push(subscription);
  }


  /**
   * Handle Infinite Scroll
   */
  onScroll(event: any): void {
    if ((event.target.offsetHeight + event.target.scrollTop) >= event.target.scrollHeight * 0.8 && !this.isLoadMore && this.products.length < this.totalProducts) {
      this.isLoadMore = true;
      this.currentPage += 1;
      this.getAllProducts(true);
    }
  }

  private getAllSeoPage() {
    const subscription = this.seoPageService.getAllSeoPageByUi({status: 'publish', 'type': 'category-page'}, 1, 1).subscribe({
      next: (res) => {
        this.seoPageData = res.data[0];
        if (isPlatformBrowser(this.platformId)) {
          this.updateMetaData();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.subscriptions.push(subscription);
  }

  /**
   * updateMetaData()
   */

  private updateMetaData() {
    // Extract product information for reuse
    const seoTitle = this.seoPageData?.seoTitle ? this.seoPageData?.seoTitle : 'Categories';
    const seoDescription = this.seoPageData?.seoDescription ? this.seoPageData?.seoDescription : this.seoPageData?.name;
    const imageUrl = this.seoPageData?.images ? this.seoPageData?.images[0] : ''; // Default to an empty string if no image is available
    const seoKeywords = this.seoPageData?.seoKeyword || ''; // Example: "organic honey, pure honey, raw honey"
    const url = window.location.href;

    // Title
    this.title.setTitle(seoTitle);

    // Meta Tags
    this.meta.updateTag({name: 'robots', content: 'index, follow'});
    this.meta.updateTag({name: 'theme-color', content: this.themeColors?.primary});
    this.meta.updateTag({name: 'description', content: seoDescription});
    this.meta.updateTag({ name: 'keywords', content: seoKeywords });

    // Open Graph (og:)
    this.meta.updateTag({property: 'og:title', content: seoTitle});
    this.meta.updateTag({property: 'og:type', content: 'website'});
    this.meta.updateTag({property: 'og:url', content: url});
    this.meta.updateTag({property: 'og:image', content: imageUrl});
    this.meta.updateTag({property: 'og:image:type', content: 'image/jpeg'});
    this.meta.updateTag({property: 'og:image:width', content: '1200'}); // Recommended width
    this.meta.updateTag({property: 'og:image:height', content: '630'}); // Recommended height
    this.meta.updateTag({property: 'og:description', content: seoDescription});
    this.meta.updateTag({property: 'og:locale', content: 'en_US'});

    // Twitter Tags
    this.meta.updateTag({name: 'twitter:title', content: seoTitle});
    this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
    this.meta.updateTag({name: 'twitter:description', content: seoDescription});
    this.meta.updateTag({name: 'twitter:image', content: imageUrl}); // Image for Twitter

    // Microsoft
    this.meta.updateTag({name: 'msapplication-TileImage', content: imageUrl});

    // Canonical
    this.canonicalService.setCanonicalURL();
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
