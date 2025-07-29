import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {BrandCardComponent} from "../../shared/components/brand-card/brand-card.component";
import {Brand} from "../../interfaces/common/brand.interface";
import {BrandService} from "../../services/common/brand.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {AppConfigService} from "../../services/core/app-config.service";
import {Subscription} from "rxjs";
import {ThemeViewSetting} from "../../interfaces/common/setting.interface";
import {BrandLoaderComponent} from "../../shared/loader/brand-loader/brand-loader.component";
import {FilterData} from "../../interfaces/core/filter-data";


@Component({
  selector: 'app-all-brands',
  standalone: true,
  imports: [
    BrandCardComponent,
    BrandLoaderComponent
  ],
  templateUrl: './all-brands.component.html',
  styleUrl: './all-brands.component.scss'
})
export class AllBrandsComponent implements OnInit, OnDestroy {

  // Store Data
  brands: Brand[] = [];
  searchQuery: string = null;
  isLoading: boolean = true;
  brandViews: string;
  protected readonly rawSrcset: string = '128w, 384w';

  // Inject
  private readonly brandService = inject(BrandService);
  protected readonly breakpointObserver = inject(BreakpointObserver);
  private readonly appConfigService = inject(AppConfigService);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Theme Settings Handle
    this.getSettingData();

    // Base Data
    this.getAllBrand();
  }

  /**
   * HTTP Request Handle
   * getAllBrand()
   **/
  private getAllBrand() {
    const filterData: FilterData = {
      pagination: null,
      filter: {status: 'publish'},
      select: {name: 1, images: 1, slug: 1},
      sort: {name: 1}
    }

    const subscription = this.brandService.getAllBrands(filterData, this.searchQuery).subscribe({
      next: (res) => {
        this.brands = res.data;
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
    const themeViewSettings: ThemeViewSetting[] = this.appConfigService.getSettingData('themeViewSettings');
    this.brandViews = themeViewSettings.find(f => f.type == 'brandViews').value.join();
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
