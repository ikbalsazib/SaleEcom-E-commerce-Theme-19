import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {
  SnackbarNotificationComponent
} from '../../shared/components/ui/snackbar-notification/snackbar-notification.component';
import {ActionSnackbarComponent} from "../../shared/components/ui/action-snackbar/action-snackbar.component";

@Injectable({
  providedIn: 'root'
})
export class UiService {

  // Inject
  private readonly snackBar = inject(MatSnackBar);


  /**
   * SNACKBAR
   * message()
   * actionMessage()
   */
  message(
    message: string,
    type: 'success' | 'warn' | 'wrong',
    option?: {
      duration?: number,
      horizontalPosition?: MatSnackBarHorizontalPosition,
      verticalPosition?: MatSnackBarVerticalPosition
    }
  ) {
    this.snackBar.openFromComponent(SnackbarNotificationComponent, {
      data: message,
      duration: option?.duration ?? 3000,
      horizontalPosition: option?.horizontalPosition ?? 'end',
      verticalPosition: option?.verticalPosition ?? 'bottom',
      panelClass: ['notification', type],
    });
  }

  actionMessage(
    message: string,
    type: 'success' | 'warn' | 'wrong',
    url: string,
    url1: string,
    icon: string,
    clickBtnText: string,
    clickBtnText1: string,
    option?: {
      duration?: number,
      horizontalPosition?: MatSnackBarHorizontalPosition,
      verticalPosition?: MatSnackBarVerticalPosition
    }
  ) {
    this.snackBar.openFromComponent(ActionSnackbarComponent, {
      data: {message, type, url,url1, icon, clickBtnText,clickBtnText1 },
      duration: option?.duration ?? 3000,
      horizontalPosition: option?.horizontalPosition ?? 'center',
      verticalPosition: option?.verticalPosition ?? 'bottom',
      panelClass: ['notification', type]
    });
  }


}


