import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Subject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {isPlatformBrowser} from "@angular/common";
import {Wishlist} from '../../interfaces/common/wishlist.interface';

const API_URL = environment.apiBaseLink + '/api/wishlist/';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  // REFRESH LOCAL STORED CART
  isBrowser: boolean;
  private refreshStoredWishlist = new Subject<void>();
  private platformId = inject(PLATFORM_ID);
  private refreshStoredWishList = new Subject<void>();
  private wishlistList: Wishlist[] = [];


  constructor(
    private httpClient: HttpClient,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * REFRESH LOCAL STORED CART FUNCTIONS
   * needRefreshStoredWishlist$()
   * refreshStoredWishList$()
   * needRefreshStoredWishList$
   */

  needRefreshStoredWishlist$() {
    this.refreshStoredWishlist.next();
  }

  get refreshStoredWishList$() {
    return this.refreshStoredWishList;
  }

  needRefreshStoredWishList$() {
    this.refreshStoredWishList.next();
  }
  /**
   * getWishlistByUser
   * addToWishlist
   * deleteWishlistById
   */
  getWishlistByUser() {
    return this.httpClient.get<{ data: Wishlist[], count: number, success: boolean }>(API_URL + 'get-wishlists-by-user');
  }

  addToWishlist(data: Wishlist) {
    return this.httpClient.post<ResponsePayload>(API_URL + 'add-to-wishlist', data);
  }

  deleteWishlistById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_URL + 'delete-by/' + id, {
      params,
    });
  }

  /**
   * CART STORE & GET LOCALLY
   * updateWishlistList()
   * wishlistItems()
   */
  public updateWishlistList(data: Wishlist[]) {
    this.wishlistList = data;
    this.needRefreshStoredWishList$();
  }

  public get wishlistItems() {
    return [...this.wishlistList];
  }

}
