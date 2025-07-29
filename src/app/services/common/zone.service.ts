import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { Zone } from '../../interfaces/common/zone.interface';

const API_URL = environment.apiBaseLink + '/api/zone/';


@Injectable({
  providedIn: 'root'
})
export class ZoneService {

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * getZoneByParentId()
   */

  getZoneByParentId(divisionId: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Zone[],
      message: string,
      success: boolean
    }>(API_URL + 'get-all-by-parent/' + divisionId, {params});
  }
}
