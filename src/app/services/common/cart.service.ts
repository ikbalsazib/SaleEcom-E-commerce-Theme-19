import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Subject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DATABASE_KEY} from '../../core/utils/global-variable';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {isPlatformBrowser} from "@angular/common";
import {Cart} from '../../interfaces/common/cart.interface';
import {ReloadService} from '../core/reload.service';

const API_URL = environment.apiBaseLink + '/api/cart/';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  // Store Data
  private refreshStoredCart = new Subject<void>();
  private cartList: Cart[] = [];

  // Inject
  private readonly platformId = inject(PLATFORM_ID);
  private readonly httpClient = inject(HttpClient);
  private readonly reloadService = inject(ReloadService);


  /**
   * REFRESH LOCAL STORED CART FUNCTIONS
   * refreshStoredCart$()
   * needRefreshStoredCart$()
   */
  get refreshStoredCart$() {
    return this.refreshStoredCart;
  }

  needRefreshStoredCart$() {
    this.refreshStoredCart.next();
  }


  /**
   * HTTP REQUEST HANDLE
   * getCartByUser()
   * addToCart()
   * addToCartMultiple()
   * updateCart()
   * updateCartQty()
   * deleteCartById()
   */
  getCartByUser() {
    return this.httpClient.get<{ data: Cart[], count: number, success: boolean }>(API_URL + 'get-carts-by-user');
  }

  addToCart(data: Cart) {
    return this.httpClient.post<ResponsePayload>(API_URL + 'add-to-cart', data);
  }

  addToCartMultiple(data: Cart[]) {
    return this.httpClient.post<ResponsePayload>(
      API_URL + 'add-to-cart-multiple',
      data
    );
  }

  updateCart(data: any) {
    return this.httpClient.put<{
      message: string;
      success: boolean;
      type: string;
    }>(API_URL + 'update', data);
  }

  updateCartQty(id: string, data: { selectedQty: number; type: string }) {
    return this.httpClient.put<{
      message: string;
      success: boolean;
      type: string;
    }>(API_URL + 'update-qty/' + id, data);
  }

  deleteCartById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_URL + 'delete-by-id/' + id, {
      params,
    });
  }


  /**
   * Cart Local Manage
   * addCartItemToLocalStorage()
   * getCartItemFromLocalStorage()
   * deleteCartItemFromLocalStorage()
   * updateCartItemFromLocalStorage()
   * deleteAllCartFromLocal()
   */

  addCartItemToLocalStorage(cartItem: Cart) {
    if (isPlatformBrowser(this.platformId)) {
      const cartData = JSON.parse(localStorage.getItem(DATABASE_KEY.userCart) || '[]');

      // Find the index of the existing item based on the variation and without variation
      const existingItemIndex = cartData.findIndex((item: any) =>
        item.product === cartItem.product &&
        (!item.variation && !cartItem.variation ||
          (item.variation && cartItem.variation && item.variation._id === cartItem.variation._id))
      );

      if (existingItemIndex !== -1) {
        cartData.splice(existingItemIndex, 1);
      }
      cartData.unshift(cartItem);

      localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(cartData));
    }
  }

  getCartItemFromLocalStorage(): Cart[] | any {
    if (isPlatformBrowser(this.platformId)) {
      const carts = localStorage.getItem(DATABASE_KEY.userCart);
      if (carts === null) {
        return [];
      }
      return JSON.parse(carts) as Cart[] | any[];
    }
  }

  deleteCartItemFromLocalStorage(ids: string[]) {
    if (isPlatformBrowser(this.platformId)) {
      const items = JSON.parse(
        localStorage.getItem(DATABASE_KEY.userCart) as any
      );
      const carts = items.filter((item: Cart) => !ids.includes(item.product as string));
      localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(carts));
    }
  }

  updateCartItemFromLocalStorage(data: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(data));
    }
  }

  deleteAllCartFromLocal(refresh?: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(DATABASE_KEY.userCart);
      this.reloadService.needRefreshCart$(refresh ? refresh : false);
    }


  }

  /**
   * CART STORE & GET LOCALLY
   * updateCartList()
   * cartItems()
   */
  public updateCartList(data: Cart[]) {
    this.cartList = data;
    this.needRefreshStoredCart$();
  }

  public get cartItems() {
    return [...this.cartList];
  }

}
