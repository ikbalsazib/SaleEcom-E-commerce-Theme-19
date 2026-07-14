import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LandingPage} from '../../interfaces/common/landing-page.interface';

const API_URL = environment.apiBaseLink + '/api/ready-landing-page/';

@Injectable({
  providedIn: 'root'
})
export class ReadyLandingPageService {

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * Get landing page by slug. API requires shop for ready-landing-page (FixedLandingPage2).
   * @param slug - landing page slug
   * @param select - optional field list
   * @param shop - shop ID from config (required by API)
   */
  getLandingBySlug(slug: string, select?: string, shop?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    if (shop) {
      params = params.append('shop', shop);
    }
    return this.httpClient.get<{
      data: LandingPage;
      message: string;
      success: boolean;
    }>(API_URL + 'get-by-slug/' + slug, { params });
  }

}
