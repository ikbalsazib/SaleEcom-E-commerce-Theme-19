import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, Signal, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { isPlatformBrowser } from "@angular/common";
import { Wishlist } from '../../interfaces/common/wishlist.interface';

const API_URL = environment.apiBaseLink + '/api/wishlist/';

@Injectable({
  providedIn: 'root',
})
export class NewWishlistService {
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  private httpClient = inject(HttpClient);

  // Wishlist Signal
  private newWishlist = signal<Wishlist[]>([]);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Signals Getter
   */
  get newWishlistItems(): Signal<Wishlist[]> {
    return this.newWishlist;
  }

  /**
   * Get Wishlist
   */
  newGetWishlistByUser() {
    this.httpClient.get<{ data: Wishlist[], count: number, success: boolean }>(API_URL + 'get-wishlists-by-user')
      .subscribe(response => {
        if (response.success) {
          this.newWishlist.set(response.data);
        }
      });
  }

  /**
   * Add to Wishlist
   */
  newAddToWishlist(data: Wishlist) {
    this.newWishlist.set([...this.newWishlist(), { ...data, _id: 'temp_' + Date.now() }]);

    this.httpClient.post<{ success: boolean, message: string, data: { _id: string } }>(API_URL + 'add-to-wishlist', data)
      .subscribe(response => {
        if (!response.success) {
          const revertedWishlist = this.newWishlist().filter(item => item.product !== data.product);
          this.newWishlist.set(revertedWishlist);
        }
      });
  }

  /**
   * Remove Item from Wishlist
   */
  newDeleteWishlistById(id: string) {
    const updatedWishlist = this.newWishlist().filter(item => item._id !== id);
    this.newWishlist.set(updatedWishlist);

    this.httpClient.delete<ResponsePayload>(API_URL + 'delete-by/' + id)
      .subscribe(response => {
        if (!response.success) {
          //  Revert change if API fails
          this.newGetWishlistByUser();
        }
      });
  }


}
