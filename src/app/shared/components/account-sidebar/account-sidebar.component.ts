import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UtilsService } from '../../../services/core/utils.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/common/user.service';
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-account-sidebar',
  templateUrl: './account-sidebar.component.html',
  styleUrl: './account-sidebar.component.scss',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  standalone: true
})
export class AccountSidebarComponent implements OnInit, OnDestroy {

  // Store Data
  currentUrl: string;

  // Inject
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);

  // Subscription
  private subscriptions: Subscription[] = [];

  /**
   * Angular Lifecycle Hooks
   */
  ngOnInit() {
    this.initRouteEvent();
  }

  /**
   * HTTP Request Handle
   * initRouteEvent()
   */
  private initRouteEvent() {
    const subscription = this.router.events.subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = this.utilsService.removeUrlQuery(event.urlAfterRedirects);
        }
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * Other Methods
   * onLogout()
   */
  onLogout(): void {
    this.userService.userLogOut(true);
  }


  /**
   * ON Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
