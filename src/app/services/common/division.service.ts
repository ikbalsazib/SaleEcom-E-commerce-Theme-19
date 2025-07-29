import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { FilterData } from '../../interfaces/core/filter-data';
import { Division } from '../../interfaces/common/division.interface';

const API_URL = environment.apiBaseLink + '/api/division/';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * getAllDivisions()
   */

  getAllDivisions(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{
      data: Division[],
      count: number,
      success: boolean
    }>(API_URL + 'get-all', filterData, {params});
  }


}
