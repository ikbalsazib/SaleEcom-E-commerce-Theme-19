import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {OfferPage} from '../../interfaces/common/offer-page.interface';

const API_URL = environment.apiBaseLink + '/api/offer-page/';

@Injectable({
  providedIn: 'root'
})
export class OfferPageService {

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * getOfferPage()
   */

  getOfferBySlug(slug: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: OfferPage,
      message: string,
      success: boolean
    }>(API_URL + 'get-by-slug/' + slug, {params});
  }

}
