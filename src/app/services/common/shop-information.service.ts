import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ShopInformation} from '../../interfaces/common/shop-information.interface';
import {Observable, of, tap} from 'rxjs';

const API_URL = environment.apiBaseLink + '/api/shop-information/';


@Injectable({
  providedIn: 'root'
})
export class ShopInformationService {

  private readonly cacheKey: string = 'shopInformation_cache';
  private shopInformationCache: Map<string, { data: ShopInformation; message: string; success: boolean }> = new Map();

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * getShopInformation()
   */

  getShopInformation(): Observable<{
    data: ShopInformation;
    fShopDomain: any;
    success: boolean;
    message: string;
  }> {
    if (this.shopInformationCache.has(this.cacheKey)) {
      return of(this.shopInformationCache.get(this.cacheKey) as {
        data: ShopInformation;
        fShopDomain: any;
        success: boolean;
        message: string;
      });
    }

    let params = new HttpParams();
    params = params.append('select', 'headerNews isShowMobileHeaderCategoryMenu isShowNewsSlider websiteName shortDescription addresses emails phones socialLinks fabIcon logoPrimary whatsappNumber showBranding brandingText');

    return this.httpClient
      .get<{
        data: ShopInformation;
        fShopDomain: any;
        success: boolean;
        message: string;
      }>(API_URL + 'get', {params})
      .pipe(
        tap((response) => {
          // Cache the response
          this.shopInformationCache.set(this.cacheKey, response);
        })
      );
  }


}
