import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {UserDataService} from '../../../services/common/user-data.service';
import {User} from '../../../interfaces/common/user.interface';
import {Subscription} from 'rxjs';
import {UserService} from "../../../services/common/user.service";
import {RecentOrderComponent} from "./recent-order/recent-order.component";
import {RecentWishlistComponent} from "./recent-wishlist/recent-wishlist.component";
import {AccountSidebarComponent} from "../../../shared/components/account-sidebar/account-sidebar.component";
import {RouterLink} from "@angular/router";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: true,
  imports: [
    RecentOrderComponent,
    RecentWishlistComponent,
    AccountSidebarComponent,
    RouterLink,
    DatePipe
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {

  // Store Data
  user?: User;

  // Inject
  private readonly userDataService = inject(UserDataService);
  private readonly userService = inject(UserService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    if (this.userService.isUser) {
      this.getLoggedInUserData();
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * Fetch User Info
   */
  private getLoggedInUserData(): void {
    const subscription = this.userDataService.getLoggedInUserData().subscribe({
      next: res => {
        this.user = res?.data;
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
