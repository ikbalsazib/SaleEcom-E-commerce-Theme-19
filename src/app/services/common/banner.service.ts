import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {FilterData} from "../../interfaces/core/filter-data";
import {Banner} from "../../interfaces/common/banner.interface";

const API_URL = environment.apiBaseLink + '/api/banner/';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  // Inject
  private httpClient = inject(HttpClient);

  /**
   * getAllBanners
   */

  getAllBanner(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Banner[], count: number, success: boolean }>(API_URL + 'get-all-by-shop', filterData, {params});
  }

}
