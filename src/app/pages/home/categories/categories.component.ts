import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Category } from '../../../interfaces/common/category.interface';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../../services/common/category.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ThemeViewSetting } from '../../../interfaces/common/setting.interface';
import { AppConfigService } from '../../../services/core/app-config.service';
import { RouterLink } from '@angular/router';
import { CategoriesCardComponent } from '../../../shared/components/categories-card/categories-card.component';
import { CategoryLoaderComponent } from '../../../shared/loader/category-loader/category-loader.component';
import { CategoryCard2Component } from '../../../shared/components/category-card-2/category-card-2.component';
import { CategoryLoader2Component } from '../../../shared/loader/category-loader-2/category-loader-2.component';
import { CategoriesCard3Component } from '../../../shared/components/category-card-3/categories-card-3.component';
import { CategoryLoader3Component } from '../../../shared/loader/category-loader-3/category-loader-3.component';
import {CategoryCard4Component} from "../../../shared/components/category-card-4/category-card-4.component";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    CategoriesCardComponent,
    CategoryLoaderComponent,
    CategoryCard2Component,
    CategoryLoader2Component,
    CategoriesCard3Component,
    CategoryLoader3Component,
    CategoryCard4Component,
  ],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  // Store Data
  categories: Category[] = [];

  isLoading: boolean = true;
  categoryViews: string;

  // Inject
  private readonly categoryService = inject(CategoryService);
  protected readonly breakpointObserver = inject(BreakpointObserver);
  private readonly appConfigService = inject(AppConfigService);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Theme Settings Handle
    this.getSettingData();

    // Base Data
    this.getAllCategory();
  }

  /**
   * HTTP Request Handle
   * getAllCategory()
   **/
  private getAllCategory() {
    const subscription = this.categoryService.getAllCategory().subscribe({
      next: (res) => {
        this.categories = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * FORM METHODS
   * getSettingData()
   **/
  private getSettingData() {
    const themeViewSettings: ThemeViewSetting[] =
      this.appConfigService.getSettingData('themeViewSettings');
    this.categoryViews = themeViewSettings
      .find((f) => f.type == 'categoryViews')
      .value.join();
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach((sub) => sub?.unsubscribe());
  }
}
