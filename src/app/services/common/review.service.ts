import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Review} from '../../interfaces/common/review.interface';
import {FilterData} from '../../interfaces/core/filter-data';
import {Product} from "../../interfaces/common/product.interface";

const API_URL = environment.apiBaseLink + '/api/review/';


@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * addReview()
   * getReviewById()
   * deleteReviewByReviewId()
   * getAllReviewsByProductId()
   * getAllReviewsByQuery()
   * getAllPendingReviewsByQuery()
   * updateReview()
   */

  addReview(data: Review) {
    return this.httpClient.post<{ message: string }>(API_URL + 'add-review-by-user', data);
  }

  getReviewById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Product, message: string, success: boolean }>(API_URL +'get-by/' + id, {params});
  }

  deleteReviewByReviewId(id: string) {
    return this.httpClient.delete<{message?: string}>(API_URL + 'delete-review-by-user/' + id);
  }

  getAllReviewsByProductId(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Review[], count: number, success: boolean }>(API_URL + 'get-all-review-by-query', filterData, {params});
  }

  getAllReviewsByQuery(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Review[], count: number, success: boolean }>(API_URL + 'get-Review-by-user', filterData, {params});
  }

  getAllPendingReviewsByQuery() {
    let params = new HttpParams();
    return this.httpClient.post<{ data: Review[], count: number, success: boolean }>(API_URL + 'get-pending-review-by-user',{params});
  }

  updateReview(data: Review) {
    return this.httpClient.put<{ message: string }>(API_URL + 'update-user', data);
  }

}
