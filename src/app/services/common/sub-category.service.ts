import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {SubCategory} from '../../interfaces/common/sub-category.interface';
import {FilterData} from '../../interfaces/core/filter-data';

const API_URL = environment.apiBaseLink + '/api/sub-category/';


@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * getAllSubCategories()
   * getSubCategoriesByCategoryId()
   */


  getAllSubCategories(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{
      data: SubCategory[],
      count: number,
      success: boolean
    }>(API_URL + 'get-all-by-shop', filterData, {params});
  }


  getSubCategoriesByCategoryId(categoryId: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: SubCategory[],
      message: string,
      success: boolean
    }>(API_URL + 'get-all-by-parent/' + categoryId, {params});
  }

}
