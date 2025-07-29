import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Category} from '../../interfaces/common/category.interface';
import {environment} from "../../../environments/environment";
import {Observable, of, tap} from 'rxjs';
import {FilterData} from '../../interfaces/core/filter-data';

const API_URL = environment.apiBaseLink + '/api/category/';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  // Store Data
  private readonly cacheKey: string = 'category_cache';
  private carouselCache: Map<string, { data: Category[]; message: string; success: boolean }> = new Map();

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * getAllCategorys
   */

  getAllCategory(): Observable<{
    data: Category[];
    success: boolean;
    message: string;
  }> {
    if (this.carouselCache.has(this.cacheKey)) {
      return of(this.carouselCache.get(this.cacheKey) as {
        data: Category[];
        success: boolean;
        message: string;
      });
    }

    return this.httpClient
      .get<{
        data: Category[];
        success: boolean;
        message: string;
      }>(API_URL + 'get-all-data')
      .pipe(
        tap((response) => {
          // Cache the response
          this.carouselCache.set(this.cacheKey, response);
        })
      );
  }



  getAllCategories(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Category[], count: number, success: boolean }>(API_URL + 'get-all-by-shop', filterData, {params});
  }
}
