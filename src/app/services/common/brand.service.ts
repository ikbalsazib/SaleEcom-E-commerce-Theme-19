import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {FilterData} from '../../interfaces/core/filter-data';
import {Brand} from '../../interfaces/common/brand.interface';
import {Observable, of, tap} from "rxjs";
const API_URL = environment.apiBaseLink + '/api/brand/';


@Injectable({
  providedIn: 'root'
})
export class BrandService {
  // Store Data
  private readonly cacheKey: string = 'brand_cache';
  private brandCache: Map<string, { data: Brand[]; message: string; success: boolean }> = new Map();

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * getAllBrands()
   */


  getAllBrands(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Brand[], count: number, success: boolean }>(API_URL + 'get-all-by-shop', filterData, {params});
  }

  getAllBrand(): Observable<{
    data: Brand[];
    success: boolean;
    message: string;
  }> {
    if (this.brandCache.has(this.cacheKey)) {
      return of(this.brandCache.get(this.cacheKey) as {
        data: Brand[];
        success: boolean;
        message: string;
      });
    }

    return this.httpClient
      .get<{
        data: Brand[];
        success: boolean;
        message: string;
      }>(API_URL + 'get-all-data')
      .pipe(
        tap((response) => {
          // Cache the response
          this.brandCache.set(this.cacheKey, response);
        })
      );
  }
}
