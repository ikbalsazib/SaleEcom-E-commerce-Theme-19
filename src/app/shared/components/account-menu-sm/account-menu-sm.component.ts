import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../../interfaces/common/user.interface';
import { UserDataService } from '../../../services/common/user-data.service';
import { Subscription } from 'rxjs';

import { UserService } from '../../../services/common/user.service';

@Component({
  selector: 'app-account-menu-sm',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './account-menu-sm.component.html',
  styleUrl: './account-menu-sm.component.scss'
})
export class AccountMenuSmComponent implements OnInit, OnDestroy {

  // Store Data
  user?: User;

  // Inject
  private readonly userDataService = inject(UserDataService);
  private readonly userService = inject(UserService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  /**
   * Angular Lifecycle Hook
   */
  ngOnInit(): void {
    if (this.userService.isUser) {
      this.getLoggedInUserData();
    }
  }

  /**
   * Fetch Logged-In User Data
   */
  private getLoggedInUserData(): void {
    const sub = this.userDataService.getLoggedInUserData().subscribe({
      next: res => {
        this.user = res.data;
      }
    });
    this.subscriptions?.push(sub);
  }

  /**
   * Handle Logout
   */
  onLogout(): void {
    this.userService.userLogOut(true);
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
