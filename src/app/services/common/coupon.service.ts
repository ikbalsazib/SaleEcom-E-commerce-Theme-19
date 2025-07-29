import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { Coupon } from '../../interfaces/common/coupon.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import {FilterData} from "../../interfaces/core/filter-data";

const API_URL = environment.apiBaseLink + '/api/coupon/';


@Injectable({
  providedIn: 'root'
})
export class CouponService {

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * checkCouponAvailability()
   * getAllCoupons()
   */

  checkCouponAvailability(data: { couponCode: string, subTotal: number }) {
    return this.httpClient.post<ResponsePayload>
    (API_URL + 'check-coupon-availability', data);
  }

  getAllCoupons(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Coupon[], count: number, success: boolean }>(API_URL + 'get-all-by-shop', filterData, {params});
  }

}
