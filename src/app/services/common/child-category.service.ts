import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Category} from '../../interfaces/common/category.interface';
import {environment} from "../../../environments/environment";
import {Observable, of, tap} from 'rxjs';

const API_URL = environment.apiBaseLink + '/api/child-category/';

@Injectable({
  providedIn: 'root'
})
export class ChildCategoryService {

  // Store Data
  private readonly cacheKey: string = 'child-category_cache';
  private carouselCache: Map<string, { data: Category[]; message: string; success: boolean }> = new Map();

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * getAllChildCategoryGroupByCategory
   */

  getAllChildCategoryGroupByCategory(): Observable<{
    data: any[];
    success: boolean;
    message: string;
  }> {
    if (this.carouselCache.has(this.cacheKey)) {
      return of(this.carouselCache.get(this.cacheKey) as {
        data: any[];
        success: boolean;
        message: string;
      });
    }

    return this.httpClient
      .get<{
        data: any[];
        success: boolean;
        message: string;
      }>(API_URL + 'get-child-categories-group-by-category')
      .pipe(
        tap((response) => {
          // Cache the response
          this.carouselCache.set(this.cacheKey, response);
        })
      );
  }


  getSubCategoriesGroupByCategory() {
    return this.httpClient.get<{ data: any[], count: number, success: boolean }>(API_URL + 'get-subcategories-group-by-category');
  }
}
