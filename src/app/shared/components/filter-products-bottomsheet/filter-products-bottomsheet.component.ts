import {Component, EventEmitter, Inject, inject, OnDestroy, OnInit, Output} from '@angular/core';
import {FilterBrandModule} from "../filter-brand/filter-brand.module";
import {FilterSubCategoryModule} from "../filter-sub-category/filter-sub-category.module";
import {
  ProductDetailsCategoryLoaderComponent
} from "../../loader/product-details-category-loader/product-details-category-loader.component";
import {ProductsCategoryComponent} from "../products-category-filter/products-category.component";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {Category} from "../../../interfaces/common/category.interface";
import {CategoryService} from "../../../services/common/category.service";
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {SubCategoryService} from "../../../services/common/sub-category.service";

@Component({
  selector: 'app-filter-products-bottomsheet',
  templateUrl: './filter-products-bottomsheet.component.html',
  styleUrl: './filter-products-bottomsheet.component.scss',
  standalone: true,
  imports: [
    FilterBrandModule,
    FilterSubCategoryModule,
    ProductDetailsCategoryLoaderComponent,
    ProductsCategoryComponent,
  ]
})
export class FilterProductsBottomsheetComponent implements OnInit, OnDestroy {
  @Output() dataEmitter = new EventEmitter<any>();

  categories: Category [] = [];
  brands: any[] = [];
  subCategories: any[] = [];
  selectedCategories: string[] = [];
  selectedSubCategories: string[] = [];
  selectedBrands: string[] = [];
  selectedTags: string[] = [];

  // Loading
  isLoading = false;

  // Complex Filter
  categoryFilterArray: any[] = [];
  subCategoryFilterArray: any[] = [];
  brandFilterArray: any[] = [];
  tagFilterArray: any[] = [];

  // FilterData
  filter: any = null;

  // Inject
  private readonly categoryService = inject(CategoryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly subCategoryService = inject(SubCategoryService);
  private readonly router = inject(Router);

  // Subscription
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<FilterProductsBottomsheetComponent>
  ) {
    this.categories = data.category;
    this.brands = data.brands;
    this.subCategories = data.subCategories;
  }

  ngOnInit(): void {

    // GET PAGE FROM QUERY PARAM
    const subscription = this.activatedRoute.queryParams.subscribe(qParam => {
      // Filter Query
      this.filterQueryFromQueryParam(qParam);
    });

    this.subscriptions?.push(subscription);

  }


  private filterQueryFromQueryParam(qParam: any) {
    if (qParam && !qParam['subCategories'] && qParam && qParam['categories']) {
      if (typeof qParam['categories'] === 'string') {
        this.selectedCategories = [qParam['categories']];
      } else {
        this.selectedCategories = qParam['categories'];
      }
      this.categoryFilterArray = this.selectedCategories.map(m => {
        return {'category.slug': m}
      });
      if(this.selectedCategories){
        if (this.selectedCategories.length) {
          const fCat = this.categories.find(f => f.slug === this.selectedCategories[0]);
          this.getSubCategoriesByCategoryId(fCat._id);
        }
      }
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

  /**
   * RESET FILTER
   * resetCategoryFilter()
   * resetSubCategoryFilter()
   * resetBrandFilter()
   */

  resetCategoryFilter() {
    this.selectedCategories = [];
    this.categoryFilterArray = [];
    this.dataEmitter.emit({
      resetCategory: true,
    });
    this.router.navigate(
      ['/products'],
      {queryParams: {categories: []}, queryParamsHandling: 'merge'}
    );
  }

  resetSubCategoryFilter() {
    this.selectedSubCategories = [];
    this.subCategoryFilterArray = [];
    this.dataEmitter.emit({
      resetSubCategory: true,
    });
    this.router.navigate(
      ['/products'],
      {queryParams: {subCategories: []}, queryParamsHandling: 'merge'}
    );
  }

  resetBrandFilter() {
    this.selectedBrands = [];
    this.brandFilterArray = [];
    this.dataEmitter.emit({
      resetBrand: true,
    });
    this.router.navigate(
      ['/products'],
      {queryParams: {brand: []}, queryParamsHandling: 'merge'}
    );
  }


  resetTagFilter() {
    this.selectedTags = [];
    this.tagFilterArray = [];
    this.dataEmitter.emit({
      resetTag: true,
    });
    this.router.navigate(
      ['/products'],
      {queryParams: {tag: []}, queryParamsHandling: 'merge'}
    );
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



  onHideCategory() {
    this.bottomSheetRef.dismiss();
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
