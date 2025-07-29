import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { Review } from '../../interfaces/common/review.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import {FilterData} from "../../interfaces/core/filter-data";


const API_CONTACT = environment.apiBaseLink + '/api/comment/';


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addComment
   */

  addComment(data: Comment) {
    return this.httpClient.post<ResponsePayload>
    (API_CONTACT + 'add-by-user', data);
  }

  getAllReviewsByQuery(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Review[], count: number, success: boolean }>(API_CONTACT + 'get-all-by-shop', filterData, {params});
  }

}
