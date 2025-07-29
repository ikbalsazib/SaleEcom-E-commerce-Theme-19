import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Wishlist} from "../../../../interfaces/common/wishlist.interface";
import {WishlistService} from "../../../../services/common/wishlist.service";
import {UserService} from "../../../../services/common/user.service";
import {ReloadService} from "../../../../services/core/reload.service";
import {Subscription} from "rxjs";
import {RouterLink} from "@angular/router";
import {WishlistCardComponent} from "../../../../shared/components/wishlist-card/wishlist-card.component";
import {EmptyDataComponent} from "../../../../shared/components/ui/empty-data/empty-data.component";

@Component({
  selector: 'app-recent-wishlist',
  templateUrl: './recent-wishlist.component.html',
  styleUrl: './recent-wishlist.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    WishlistCardComponent,
    EmptyDataComponent
  ]
})
export class RecentWishlistComponent implements OnInit, OnDestroy {

  // Store Data
  orders: any[] = [];
  isLoading: boolean = true;
  wishlists: Wishlist[] = [];

  // Inject
  private readonly wishlistService = inject(WishlistService);
  private readonly userService = inject(UserService);
  private readonly reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.reloadService.refreshWishList$.subscribe(() => {
      this.getWishlistItems();
    });
    setTimeout(() => {
      this.isLoading = false;

    }, 100)
    //   Base Data
    if(this.userService.getUserStatus()){
      this.getWishlistItems();
    }
   
  }

  private getWishlistItems() {
    this.isLoading = true;
    if (this.userService.isUser) {
      const subscription =  this.wishlistService.getWishlistByUser().subscribe({
          next: res => {
            this.isLoading = false;
            this.wishlists = res.data;
          },
          error: error => {
            this.isLoading = false;
            console.log(error);
          }
        });
      this.subscriptions?.push(subscription);
    }
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
