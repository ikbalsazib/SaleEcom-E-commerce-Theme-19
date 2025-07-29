import {Component, inject, OnInit, Signal} from '@angular/core';
import { Subscription } from "rxjs";
import { ReloadService } from "../../../services/core/reload.service";
import { UserService } from "../../../services/common/user.service";
import { Wishlist } from "../../../interfaces/common/wishlist.interface";
import {WishlistCardComponent} from "../../../shared/components/wishlist-card/wishlist-card.component";
import {MobileHeaderComponent} from "../../../shared/components/core/mobile-header/mobile-header.component";
import {AccountSidebarComponent} from "../../../shared/components/account-sidebar/account-sidebar.component";
import {EmptyDataComponent} from "../../../shared/components/ui/empty-data/empty-data.component";
import {WishlistLoaderComponent} from "../../../shared/loader/wishlist-loader/wishlist-loader.component";
import {NewWishlistService} from "../../../services/common/new-wishlist.service";

@Component({
  selector: 'app-my-wishlist',
  templateUrl: './my-wishlist.component.html',
  styleUrl: './my-wishlist.component.scss',
  standalone: true,
  imports: [
    WishlistCardComponent,
    MobileHeaderComponent,
    AccountSidebarComponent,
    EmptyDataComponent,
    WishlistLoaderComponent,
  ]
})
export class MyWishlistComponent implements OnInit {

  // Store Data
  isLoading: boolean = true;

  // Inject
  private readonly newWishlistService = inject(NewWishlistService);
  private readonly userService = inject(UserService);
  private readonly reloadService = inject(ReloadService);

  // Subscription
  private subscriptions: Subscription[] = [];

  // Wishlist Signal
  wishlists: Signal<Wishlist[]> = this.newWishlistService.newWishlistItems;


  ngOnInit() {
    // Base Data
    if(this.userService.getUserStatus()){
      this.getWishlistItems();
    }
    
  }

  /**
   * HTTP Request Handle
   * getWishlistItems()
   **/
  private getWishlistItems() {
    this.isLoading = true;
    if (this.userService.isUser) {
      this.newWishlistService.newGetWishlistByUser();
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }


}
