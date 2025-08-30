import {Component, inject, Input} from '@angular/core';
import {Product, VariationList} from "../../../../interfaces/common/product.interface";
import {StarRatingViewComponent} from "../../star-rating-view/star-rating-view.component";
import {CurrencyCtrPipe} from "../../../pipes/currency.pipe";
import {ProductPricePipe} from "../../../pipes/product-price.pipe";
import {RouterLink} from "@angular/router";
import {AppConfigService} from "../../../../services/core/app-config.service";
import {SlicePipe} from "@angular/common";

@Component({
  selector: 'app-product-card-5',
  templateUrl: './product-card-5.component.html',
  styleUrl: './product-card-5.component.scss',
  standalone: true,
  imports: [
    StarRatingViewComponent,
    CurrencyCtrPipe,
    ProductPricePipe,
    RouterLink,
    SlicePipe
  ]
})
export class ProductCard5Component {
  // Decorator
  @Input() product: Product = null;
  selectedVariationList: VariationList = null;
  selectedVariation: string = null;
  selectedVariation2: string = null;
  private readonly appConfigService = inject(AppConfigService);
  ngOnInit() {
    // Set Default Variation
    if (this.product?.isVariation) {
      this.setDefaultVariation();
    }
  }
  /**
   * Calculate
   * ratingCount()
   */
  get ratingCount(): number {
    if (this.product) {
      return Math.floor((this.product?.ratingTotal ?? 0) / (this.product?.ratingCount ?? 0));
    } else {
      return 0;
    }
  }

  get productDetailsRouterLink(): any[] {
    const productSetting = this.appConfigService.getSettingData('productSetting');
    const slug = this.product?.slug;
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      console.warn('Product slug is missing or invalid:', slug, this.product);
      return ['/']; // fallback to home or show error
    }
    if (!productSetting || !productSetting.urlType) {
      return ['/product-details', slug];
    }
    let link;
    switch (productSetting.urlType) {
      case 'website.com/product-details/test-product':
        link = ['/product-details', slug];
        break;
      case 'website.com/products/test-product':
        link = ['/products', slug];
        break;
      case 'website.com/test-product':
        link = ['/', slug];
        break;
      default:
        link = ['/product-details', slug];
        break;
    }
    return link;
  }


  private setDefaultVariation() {
    if (this.product?.variation) {
      this.selectedVariation = this.product?.variationOptions[0];
    }
    if (this.product?.variation2) {
      this.selectedVariation2 = this.product?.variation2Options[0];
    }
    // Selected Variation List
    this.setSelectedVariationList();

  }

  private setSelectedVariationList() {
    if (this.selectedVariation && this.selectedVariation2) {
      this.selectedVariationList = this.product?.variationList.find(
        f => f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
      );
    } else {
      this.selectedVariationList = this.product?.variationList.find(f => f.name === `${this.selectedVariation}`)
    }
  }
}
