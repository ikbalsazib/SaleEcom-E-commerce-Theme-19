import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LandingPage} from '../../interfaces/common/landing-page.interface';

const API_URL = environment.apiBaseLink + '/api/fixed-landing-page/';

@Injectable({
  providedIn: 'root'
})
export class FixedLandingPageService {

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * getLandingPage()
   */

  getLandingBySlug(slug: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: LandingPage,
      message: string,
      success: boolean
    }>(API_URL + 'get-by-slug/' + slug, {params});
  }

}
