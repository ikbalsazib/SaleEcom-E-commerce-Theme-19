import {Component, inject, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from "@angular/material/snack-bar";
import {MatIcon} from "@angular/material/icon";
import {Router} from "@angular/router";

@Component({
  selector: 'app-cart-snackbar-notification',
  templateUrl: './cart-snackbar-notification.component.html',
  styleUrl: './cart-snackbar-notification.component.scss',
  imports: [
    MatIcon
  ],
  standalone: true
})
export class CartSnackbarNotificationComponent  {

  private readonly router = inject(Router);
  constructor(
    public snackBarRef: MatSnackBarRef<CartSnackbarNotificationComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
  ) {
  }


  dismissWithAction() {
    this.snackBarRef.dismissWithAction();
  }

  viewCart(): void {
    this.dismissWithAction();
    // Add navigation logic here
    this.router.navigate(['/cart'])
  }

}
