import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class ReloadService {
  private refreshData = new Subject<void>();
  private refreshDeliveryCharge = new Subject<void>();
  private refreshCart = new BehaviorSubject<boolean>(false);
  private refreshCompareList = new Subject<void>();
  private refreshWishList = new Subject<void>();
  private refreshSticky = new Subject();


  /**
   * Data Reload Method
   * refreshData$()
   * needRefreshData$()needRefreshSticky$
   */
  get refreshData$() {
    return this.refreshData;
  }

  needRefreshData$() {
    this.refreshData.next();
  }

  /**
   * Data Reload Method
   * refreshData$()
   * needRefreshData$()
   */
  get refreshDeliveryCharge$() {
    return this.refreshDeliveryCharge;
  }

  needRefreshDeliveryCharge$() {
    this.refreshDeliveryCharge.next();
  }

  /**
   * Cart Reload Method
   * refreshCart$()
   * needRefreshData$()
   */
  get refreshCart$() {
    return this.refreshCart;
  }

  needRefreshCart$(data?: boolean) {
    this.refreshCart.next(data);
  }

  /**
   * REFRESH GLOBAL DATA
   * refreshWishList$()
   * needRefreshWishList$()
   */
  get refreshWishList$() {
    return this.refreshWishList;
  }
  needRefreshWishList$() {
    this.refreshWishList$.next();
  }

  /**
   * REFRESH COMPARE DATA
   * refreshCompareList$()
   * needRefreshCompareList$()
   */
  get refreshCompareList$() {
    return this.refreshCompareList;
  }

  needRefreshCompareList$() {
    this.refreshCompareList.next();
  }


  /**
   * REFRESH Sticky
   */

  get refreshSticky$() {
    return this.refreshSticky;
  }

  needRefreshSticky$(data: boolean) {
    this.refreshSticky.next(data);
  }
}
