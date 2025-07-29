import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { Area } from '../../interfaces/common/area.interface';

const API_URL = environment.apiBaseLink + '/api/area/';

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  // Inject
  private httpClient = inject(HttpClient);


  /**
   * getAreaByParentId()
   */

  getAreaByParentId(divisionId: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Area[],
      message: string,
      success: boolean
    }>(API_URL + 'get-all-by-parent/' + divisionId, {params});
  }

}
