import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {FilterData} from "../../interfaces/core/filter-data";
import {SeoPage} from "../../interfaces/common/seo-page.interface";
import {Observable, of, tap} from "rxjs";
import {Product} from "../../interfaces/common/product.interface";

const API_URL = environment.apiBaseLink + '/api/seo-page/';

@Injectable({
  providedIn: 'root'
})
export class SeoPageService {
  // Store Data For Cache
  private seoCache: Map<string, { data: SeoPage[]; message: string; success: boolean }> = new Map();

  // Inject
  private httpClient = inject(HttpClient);

  /**
   * getAllSeoPages
   */

  getAllSeoPageByUi(filter: any, page: number, limit: number): Observable<{
    data: SeoPage[];
    message: string;
    success: boolean;
  }> {
    // Generate a unique cache key based on filterData
    const cacheKey = JSON.stringify({filter});

    // Check if data is already cached
    if (this.seoCache.has(cacheKey)) {
      return of(this.seoCache.get(cacheKey) as {
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
          this.seoCache.set(cacheKey, response);
        })
      );
  }

  getAllSeoPage(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: SeoPage[], count: number, success: boolean }>(API_URL + 'get-all-by-shop', filterData, {params});
  }

}
