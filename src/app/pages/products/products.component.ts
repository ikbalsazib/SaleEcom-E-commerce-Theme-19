import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import {Product} from '../../interfaces/common/product.interface';
import {ProductService} from '../../services/common/product.service';
import {FilterData, FilterGroup} from '../../interfaces/core/filter-data';
import {Subscription} from 'rxjs';
import {Category} from "../../interfaces/common/category.interface";
import {CategoryService} from "../../services/common/category.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Pagination} from "../../interfaces/core/pagination";
import {AppConfigService} from "../../services/core/app-config.service";
import {Meta, Title} from "@angular/platform-browser";
import {CanonicalService} from "../../services/core/canonical.service";
import {ThemeViewSetting} from '../../interfaces/common/setting.interface';
import {isPlatformBrowser} from "@angular/common";
import {ProductsCategoryComponent} from "../../shared/components/products-category-filter/products-category.component";
import {
  ProductDetailsCategoryLoaderComponent
} from "../../shared/loader/product-details-category-loader/product-details-category-loader.component";
import {ProductCard1Component} from "../../shared/components/product-cards/product-card-1/product-card-1.component";
import {ProductCardLoaderComponent} from "../../shared/loader/product-card-loader/product-card-loader.component";
import {FilterSubCategoryModule} from "../../shared/components/filter-sub-category/filter-sub-category.module";
import {FilterBrandModule} from "../../shared/components/filter-brand/filter-brand.module";
import {EmptyDataComponent} from "../../shared/components/ui/empty-data/empty-data.component";
import {ProductCard2Component} from "../../shared/components/product-cards/product-card-2/product-card-2.component";
import {
  FilterProductsBottomsheetComponent
} from "../../shared/components/filter-products-bottomsheet/filter-products-bottomsheet.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {ProductCard3Component} from "../../shared/components/product-cards/product-card-3/product-card-3.component";
import {BrandService} from '../../services/common/brand.service';
import {Brand} from '../../interfaces/common/brand.interface';
import {SubCategoryService} from '../../services/common/sub-category.service';
import {SubCategory} from '../../interfaces/common/sub-category.interface';
import {ProductCard4Component} from '../../shared/components/product-cards/product-card-4/product-card-4.component';
import {OutSideClickDirective} from "../../shared/directives/out-side-click.directive";
import {SeoPageService} from "../../services/common/seo-page.service";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  standalone: true,
  imports: [
    ProductsCategoryComponent,
    ProductDetailsCategoryLoaderComponent,
    ProductCard1Component,
    ProductCardLoaderComponent,
    FilterSubCategoryModule,
    FilterBrandModule,
    EmptyDataComponent,
    ProductCard2Component,
    FilterSubCategoryModule,
    ProductCard3Component,
    ProductCard4Component,
    OutSideClickDirective,
  ]
})
export class ProductsComponent implements OnInit, OnDestroy {

  // Theme Views
  productCardViews: string;

  // Scroll
  isHeaderTopHidden: boolean = false;

  // Store Data
  products: Product[] = [];
  categorySlide = false;
  selectedCategory?: string;
  categories: Category [] = [];
  subCategories: SubCategory [] = [];
  brands: Brand [] = [];
  selectedCategories: string[] = [];
  selectedSubCategories: string[] = [];
  selectedBrands: string[] = [];
  selectedTags: string[] = [];
  searchQuery: string = null;
  isLoadMore = false;
  seoPageData: any;
  themeColors: any;

  // Loading
  isLoading = true;

  // Pagination
  currentPage = 1;
  totalProducts = 0;
  productsPerPage = 16;

  // Sort
  sortQuery = {createdAt: -1};
  activeSort: number = null;

  // Complex Filter
  categoryFilterArray: any[] = [];
  subCategoryFilterArray: any[] = [];
  brandFilterArray: any[] = [];
  tagFilterArray: any[] = [];
  ratingFilterArray: any[] = [];
  priceFilterArray: any[] = [];

  // FilterData
  filter: any = null;

  // Inject
  private readonly appConfigService = inject(AppConfigService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly subCategoryService = inject(SubCategoryService);
  private readonly brandService = inject(BrandService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly canonicalService = inject(CanonicalService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly seoPageService = inject(SeoPageService);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {

    // GET PAGE FROM QUERY PARAM
    const subscription = this.activatedRoute.queryParams.subscribe(qParam => {

      // Search Query
      this.searchQueryFromQueryParam(qParam);

      // Filter Query
      this.filterQueryFromQueryParam(qParam);

      // Fetch data
      this.getAllProducts();
      this.getAllCategories();
      this.getAllBrands();
    });
    this.subscriptions?.push(subscription);

    if (isPlatformBrowser(this.platformId)) {
      this.updateMetaData();
    }

    // Theme Base
    this.getSettingData();
    this.getAllSeoPage();
  }

  onContinueShopping(): void {
    this.filter = null;
    this.categoryFilterArray = [];
    this.subCategoryFilterArray = [];
    this.brandFilterArray = [];
    this.tagFilterArray = [];
    this.ratingFilterArray = [];
    this.priceFilterArray = [];
    this.selectedCategories = [];
    this.selectedSubCategories = [];
    this.selectedBrands = [];
    this.selectedTags = [];
    this.searchQuery = null;
    this.currentPage = 1;
    this.getAllProducts();
  }

  /**
   * HTTP Request Handle
   * getAllProducts()
   * getAllCategory()
   * getSettingData()
   */
  private getAllProducts(loadMore?: boolean) {
    const pagination: Pagination = {
      pageSize: Number(this.productsPerPage),
      currentPage: Number(this.currentPage) - 1
    };
    // Select
    const mSelect = {
      name: 1,
      isVariation: 1,
      images: 1,
      tags: 1,
      slug: 1,
      category: 1,
      subCategory: 1,
      brand: 1,
      salePrice: 1,
      regularPrice: 1,
      totalSold: 1,
      variation: 1,
      variation2: 1,
      discountType: 1,
      ratingCount: 1,
      ratingTotal: 1,
      reviewTotal: 1,
      quantity: 1,
      variationOptions: 1,
      variation2Options: 1,
      variationList: 1,
      discountAmount: 1,
      minimumWholesaleQuantity: 1,
      wholesalePrice: 1,
    }
    const mGroup: FilterGroup = {
      isGroup: true,
      category: true,
      subCategory: true,
      brand: true,
    }

    // Compleax Filter Array Based on Selections
    const comFilter: any[] = [];
    if (this.categoryFilterArray.length) {
      comFilter.push(
        {$or: this.categoryFilterArray}
      );
    }

    if (this.subCategoryFilterArray.length) {
      comFilter.push(
        {$or: this.subCategoryFilterArray}
      );
    }

    if (this.brandFilterArray.length) {
      comFilter.push(
        {$or: this.brandFilterArray}
      );
    }

    if (this.tagFilterArray.length) {
      comFilter.push(
        {$or: this.tagFilterArray}
      );
    }

    if (this.ratingFilterArray.length) {
      comFilter.push(
        {$or: this.ratingFilterArray}
      );
    }

    if (this.priceFilterArray.length) {
      comFilter.push(
        {$or: this.priceFilterArray}
      );
    }

    let mFilter;
    if (comFilter.length) {
      mFilter = {
        ...this.filter,
        ...{
          $and: comFilter
        }
      }
    } else {
      mFilter = this.filter;
    }

    const filterData: FilterData = {
      pagination: pagination,
      filter: {...mFilter, status: 'publish'},
      filterGroup: null,
      select: mSelect,
      sort: this.sortQuery
    }

    const subscription = this.productService.getAllProducts(filterData, this.searchQuery).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isLoadMore = false;
        if (loadMore) {
          this.products = [...this.products, ...res.data];
        } else {
          this.products = res.data;
        }

        this.totalProducts = res.count;

        // if (!loadMore) {
        //   if (!this.productFilterGroup) {
        //     this.productFilterGroup = res.filterGroup;
        //   }
        //   if (this.productFilterGroup) {
        //     if (this.selectedCategories.length) {
        //       this.checkCategoryFilter();
        //     }
        //     if (this.selectedSubCategories.length) {
        //       this.checkSubCategoryFilter();
        //     }
        //     if (this.selectedBrands.length) {
        //       this.checkBrandFilter();
        //     }
        //   }
        // }
        this.updateMetaData();
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err);
      },
    });
    this.subscriptions?.push(subscription);
  }

  private getAllCategories() {
    const filterData: FilterData = {
      pagination: null,
      filter: {status: 'publish'},
      select: {name: 1, images: 1, slug: 1},
      sort: {name: 1}
    }

    const subscription = this.categoryService.getAllCategories(filterData, this.searchQuery)
      .subscribe({
        next: res => {
          this.categories = res.data;
          if (this.selectedCategories.length) {
            const fCat = this.categories.find(f => f.slug === this.selectedCategories[0]);
            this.getSubCategoriesByCategoryId(fCat._id);
          }
        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }

  private getSubCategoriesByCategoryId(categoryId: string) {
    const select = 'name slug images'
    const subscription = this.subCategoryService.getSubCategoriesByCategoryId(categoryId, select)
      .subscribe({
        next: res => {
          this.subCategories = res.data;
        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }

  private getAllBrands() {
    const filterData: FilterData = {
      pagination: null,
      filter: {status: 'publish'},
      select: {name: 1, images: 1, slug: 1},
      sort: {name: 1}
    }

    const subscription = this.brandService.getAllBrands(filterData, this.searchQuery)
      .subscribe({
        next: res => {
          this.brands = res.data;
        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }

  private getSettingData() {
    const themeViewSettings: ThemeViewSetting[] = this.appConfigService.getSettingData('themeViewSettings');
    this.productCardViews = themeViewSettings.find(f => f.type == 'productCardViews').value.join();
    this.themeColors = this.appConfigService.getSettingData('themeColors');
  }

  /**
   * searchQueryFromQueryParam()
   * filterQueryFromQueryParam()
   */

  private searchQueryFromQueryParam(qParam: any) {
    if (qParam && qParam['searchQuery']) {
      this.searchQuery = qParam['searchQuery'];

    } else {
      this.searchQuery = null;

    }
  }

  private filterQueryFromQueryParam(qParam: any) {
    this.currentPage = 1;
    if (qParam && qParam && qParam['categories']) {
      if (typeof qParam['categories'] === 'string') {
        this.selectedCategories = [qParam['categories']];
      } else {
        this.selectedCategories = qParam['categories'];
      }
      this.categoryFilterArray = this.selectedCategories.map(m => {
        return {'category.slug': m}
      });
    }

    if (qParam && qParam['subCategories']) {
      if (typeof qParam['subCategories'] === 'string') {
        this.selectedSubCategories = [qParam['subCategories']];
      } else {
        this.selectedSubCategories = qParam['subCategories'];
      }
      this.subCategoryFilterArray = this.selectedSubCategories.map(m => {
        return {'subCategory.slug': m}
      });
    }

    if (qParam && qParam['brand']) {
      if (typeof qParam['brand'] === 'string') {
        this.selectedBrands = [qParam['brand']];
      } else {
        this.selectedBrands = qParam['brand'];
      }
      this.brandFilterArray = this.selectedBrands.map(m => {
        return {'brand.slug': m}
      });
    }
    if (qParam && qParam['tag']) {
      if (typeof qParam['tag'] === 'string') {
        this.selectedTags = [qParam['tag']];
      } else {
        this.selectedTags = qParam['tag'];
      }
      this.tagFilterArray = this.selectedTags.map(m => {
        return {'tags.name': m}
      });
    }

  }

  openFilterBottomSheet() {
    const mData = {
      category:this.categories,
      brands:this.brands,
      subCategories:this.subCategories,
    }
    const bottomSheetRef = this.bottomSheet.open(FilterProductsBottomsheetComponent, {
      data: mData
    });

    // Listen for emitted data from the bottom sheet component
    bottomSheetRef.instance.dataEmitter.subscribe(result => {
      if (result) {
        this.selectedCategory = result.selectedCategory;

        if(result.resetCategory){
          this.selectedCategories = [];
          this.categoryFilterArray = [];
        }
        if(result.resetSubCategory){
          this.selectedSubCategories = [];
          this.subCategoryFilterArray = [];
        }
        if(result.resetBrand){
          this.selectedBrands = [];
          this.brandFilterArray = [];
        }
        if(result.resetTag){
          this.selectedTags = [];
          this.tagFilterArray = [];
        }
        bottomSheetRef.dismiss();
      }
    });
  // }
  }


  /**
   * SORTING
   */
  sortData(query: any, type: number) {
    this.sortQuery = query;
    this.activeSort = type;
    this.getAllProducts();
  }


  onPriceRangeChange(data: any) {
    this.priceFilterArray = [data];
    this.getAllProducts();
  }


  /**
   * RESET FILTER
   * resetCategoryFilter()
   * resetSubCategoryFilter()
   * resetBrandFilter()
   */

  resetCategoryFilter() {
    this.selectedCategories = [];
    this.categoryFilterArray = [];

    this.router.navigate(
      ['/products'],
      {queryParams: {categories: []}, queryParamsHandling: ''}
    );
  }

  selectedFilter() {

  }

  resetSubCategoryFilter() {
    this.selectedSubCategories = [];
    this.subCategoryFilterArray = [];
    // this.productFilterGroup.subCategories.forEach((cat, i) => {
    //   this.productFilterGroup.subCategories[i].select = false;
    // });
    this.router.navigate(
      ['/products'],
      {queryParams: {subCategories: []}, queryParamsHandling: 'merge'}
    );
  }

  resetBrandFilter() {
    this.selectedCategories = [];
    this.selectedSubCategories = [];
    this.selectedBrands = [];
    this.brandFilterArray = [];
    this.router.navigate(
      ['/products'],
      {queryParams: {brand: []}, queryParamsHandling: ''}
    );
  }

  /*Toggle on show and feature item*/
  dropdownSortOpen: boolean = false;
  selectedSortValue: string = '';
  sortOptions: string[] = ['Low to High', 'High to Low'];

  toggleDropdownSort() {
    this.dropdownSortOpen = !this.dropdownSortOpen;
    this.cdr.detectChanges();
  }

  selectSortOption(option: string, event: Event) {
    event.stopPropagation(); // Prevent event bubbling
    this.selectedSortValue = option;
    this.dropdownSortOpen = false;
    if (this.selectedSortValue === 'Low to High') {
      this.sortData({salePrice: 1}, 3);
    } else {
      this.sortData({salePrice: -1}, 4);
    }
  }

  // Detects outside click and closes the dropdown
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !targetElement.closest('.custom-select')) {
      this.dropdownSortOpen = false; // Close the dropdown if the click is outside
    }
  }

  /*Toggle on show and feature item ends here*/

  onShowCategory() {
    this.categorySlide = true;
  }

  onHideCategory() {
    this.categorySlide = false;
    // this.selectedCategory = null;
  }

  onHideCategoryMouseMove() {
    setTimeout(() => {
      if (this.categorySlide && this.selectedCategory) {
        this.categorySlide = false;
        this.selectedCategory = null;
      }
    }, 100);
  }

  /**
   * LOAD MORE
   */
  onLoadMore() {
    if (this.totalProducts > this.products.length) {
      this.isLoadMore = true;
      this.currentPage += 1;
      this.getAllProducts(true);
    }
  }


  private getAllSeoPage() {
    const subscription = this.seoPageService.getAllSeoPageByUi({status: 'publish', 'type': 'product-list-page'}, 1, 1).subscribe({
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
    const seoTitle = this.seoPageData?.seoTitle ? this.seoPageData?.seoTitle : 'Our Products';
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
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
