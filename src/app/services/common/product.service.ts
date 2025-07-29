import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Product, ProductFilterGroup} from '../../interfaces/common/product.interface';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from "../../../environments/environment";
import {FilterData} from "../../interfaces/core/filter-data";
import {isPlatformBrowser} from '@angular/common';
import {Observable, of, tap} from 'rxjs';

const API_URL = environment.apiBaseLink + '/api/product/';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // Store Data For Cache
  private productsCache: Map<string, { data: Product[]; message: string; success: boolean }> = new Map();

  // Inject
  private readonly platformId = inject(PLATFORM_ID);
  private readonly httpClient = inject(HttpClient);


  /**
   * getAllProductsByUi()
   * getAllProducts()
   * getProductBySlug()
   * getProductByUserById()
   * getProductByIds
   * getCompareList()
   * deleteCompareItem()
   */

  getAllProductsByUi(filter: any, page: number, limit: number): Observable<{
    data: Product[];
    message: string;
    success: boolean;
  }> {
    // Generate a unique cache key based on filterData
    const cacheKey = JSON.stringify({filter});

    // Check if data is already cached
    if (this.productsCache.has(cacheKey)) {
      return of(this.productsCache.get(cacheKey) as {
        data: Product[];
        message: string;
        success: boolean;
      });
    }

    let params = new HttpParams();
    if (filter) {
      // Dynamically add filters to query parameters
      Object.keys(filter).forEach(key => {
        if (filter[key] !== undefined && filter[key] !== null) {
          params = params.set(key, filter[key]);
        }
      });
    }

    if (page) {
      params = params.set('page', page);
    }

    if (limit) {
      params = params.set('limit', limit);
    }

    return this.httpClient
      .get<{
        data: Product[];
        message: string;
        success: boolean;
      }>(API_URL + 'get-all-data', {params})
      .pipe(
        tap((response) => {
          // Cache the response
          this.productsCache.set(cacheKey, response);
        })
      );
  }

  getAllProducts(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{
      data: Product[],
      count: number,
      success: boolean,
      filterGroup: ProductFilterGroup,
    }>(API_URL + 'get-all-by-shop', filterData, {params});
  }

  getProductBySlug(slug: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Product,
      message: string,
      success: boolean
    }>(API_URL + 'get-by-slug/' + slug, {params});
  }

  getProductByUserById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Product,
      message: string,
      success: boolean
    }>(API_URL + 'get-product-by-id/' + id, {params});
  }

  getProductByIds(ids: string[], select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.post<{
      data: Product[];
      count: number;
      success: boolean;
    }>(API_URL + 'get-products-by-ids', {ids}, {params});
  }

  getCompareList(): string[] {

    if (isPlatformBrowser(this.platformId)) {
      const localDataList = localStorage.getItem('compareListV2');
      if (localDataList) {
        return JSON.parse(localDataList) as any[];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  deleteCompareItem(id: string) {

    if (isPlatformBrowser(this.platformId)) {
      const items = JSON.parse(localStorage.getItem('compareListV2') as any);
      const filtered = items.filter((el: any) => el._id !== id);
      if (filtered && filtered.length) {
        localStorage.setItem('compareListV2', JSON.stringify(filtered));
      } else {
        localStorage.removeItem('compareListV2');
      }
    }
  }

}
