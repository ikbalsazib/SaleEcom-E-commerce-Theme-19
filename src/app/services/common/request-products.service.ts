import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {RequestProduct} from '../../interfaces/common/request-product.interface';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';

const API_URL = environment.apiBaseLink + '/api/request-product/';

@Injectable({
  providedIn: 'root',
})
export class RequestProductsService {

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * addRequestProduct()
   */

  addRequestProduct(data: RequestProduct): Observable<ResponsePayload> {
    return this.httpClient.post<ResponsePayload>(API_URL + 'add', data);
  }

}
