import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Tag} from '../../interfaces/common/tag.interface';
import {Observable, of, tap} from 'rxjs';

const API_URL = environment.apiBaseLink + '/api/tag/';


@Injectable({
  providedIn: 'root'
})
export class TagService {

  // Store Data For Cache
  private readonly cacheKey: string = 'tag_cache';
  private tagCache: Map<string, { data: Tag[]; message: string; success: boolean }> = new Map();

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * getAllTags
   */

  getAllTags(): Observable<{
    data: Tag[];
    success: boolean;
    message: string;
  }> {
    if (this.tagCache.has(this.cacheKey)) {
      return of(this.tagCache.get(this.cacheKey) as {
        data: Tag[];
        success: boolean;
        message: string;
      });
    }

    return this.httpClient
      .get<{
        data: Tag[];
        success: boolean;
        message: string;
      }>(API_URL + 'get-all-data')
      .pipe(
        tap((response) => {
          // Cache the response
          this.tagCache.set(this.cacheKey, response);
        })
      );
  }

}
