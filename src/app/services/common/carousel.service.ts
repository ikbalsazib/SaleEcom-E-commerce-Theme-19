import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Carousel} from "../../interfaces/common/carousel.interface";
import {Observable, of, tap} from 'rxjs';

const API_URL = environment.apiBaseLink + '/api/carousel/';

@Injectable({
  providedIn: 'root',
})
export class CarouselService {

  private readonly cacheKey: string = 'carousel_cache';
  private carouselCache: Map<string, { data: Carousel[]; message: string; success: boolean }> = new Map();

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * getAllCarousel
   */

  getAllCarousel(): Observable<{
    data: Carousel[];
    success: boolean;
    message: string;
  }> {
    if (this.carouselCache.has(this.cacheKey)) {
      return of(this.carouselCache.get(this.cacheKey) as {
        data: Carousel[];
        success: boolean;
        message: string;
      });
    }

    return this.httpClient
      .get<{
        data: Carousel[];
        success: boolean;
        message: string;
      }>(API_URL + 'get-all-data')
      .pipe(
        tap((response) => {
          // Cache the response
          this.carouselCache.set(this.cacheKey, response);
        })
      );
  }

}
