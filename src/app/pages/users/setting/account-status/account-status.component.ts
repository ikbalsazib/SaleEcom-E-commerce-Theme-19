import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { User } from '../../../../interfaces/common/user.interface';
import { UserDataService } from '../../../../services/common/user-data.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { Subscription } from 'rxjs';
import { UiService } from '../../../../services/core/ui.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/dialog/confirm-dialog/confirm-dialog.component';
import {UserService} from "../../../../services/common/user.service";

@Component({
  selector: 'app-account-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-status.component.html',
  styleUrl: './account-status.component.scss',
})
export class AccountStatusComponent implements OnInit, OnDestroy {

  // Store Data
  user?: User | any;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Inject
  private readonly userDataService = inject(UserDataService);
  private readonly reloadService = inject(ReloadService);
  private readonly uiService = inject(UiService);
  private readonly dialog = inject(MatDialog);
  protected readonly userService = inject(UserService);

  ngOnInit(): void {
    this.handleDataRefresh();
    if (this.userService.isUser) {
      this.getLoggedInUserInfo();
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * handleDataRefresh
   * getLoggedInUserInfo
   * updateLoggedInUserInfo
   */
  private handleDataRefresh(): void {
    const subscription = this.reloadService.refreshData$.subscribe(() => {
      this.getLoggedInUserInfo();
    });
    this.subscriptions?.push(subscription);
  }

  private getLoggedInUserInfo(): void {
    const subscription = this.userDataService.getLoggedInUserData().subscribe({
      next: res => {
        this.user = res?.data;
      }
    });
    this.subscriptions?.push(subscription);
  }

  private updateLoggedInUserInfo(data: any): void {
    const subscription = this.userDataService.updateLoggedInUserInfo(data).subscribe({
      next: res => {
        this.uiService.message(res.message, 'success');
        this.reloadService.needRefreshData$();
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * Handle Status Change
   */
  statusChange(data: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      width: '100%',
      height: 'auto',
      panelClass: ['dialog', 'add-address'],
      data: {
        title: 'Confirm Deactivate',
        message: 'Are you sure you want to deactivate?',
      },
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.updateLoggedInUserInfo({ status: data });
      }
    });
  }

  /**
   * ON Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
