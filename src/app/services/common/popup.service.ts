import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Popup} from '../../interfaces/common/popup.interface';
import {Observable, of, tap} from "rxjs";

const API_URL = environment.apiBaseLink + '/api/popup/';


@Injectable({
  providedIn: 'root'
})
export class PopupService {

  // Store Data
  private readonly cacheKey: string = 'popup_cache';
  private tagCache: Map<string, { data: Popup; message: string; success: boolean }> = new Map();

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * getPopup()
   */

  getPopup(): Observable<{
    data: Popup;
    success: boolean;
    message: string;
  }> {
    if (this.tagCache.has(this.cacheKey)) {
      return of(this.tagCache.get(this.cacheKey) as {
        data: Popup;
        success: boolean;
        message: string;
      });
    }

    return this.httpClient
      .get<{
        data: Popup;
        success: boolean;
        message: string;
      }>(API_URL + 'get-popup')
      .pipe(
        tap((response) => {
          // Cache the response
          this.tagCache.set(this.cacheKey, response);
        })
      );
  }


}
