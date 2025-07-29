import {Component, Inject, inject} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {Router} from "@angular/router";
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from "@angular/material/snack-bar";

@Component({
  selector: 'app-action-snackbar',
  standalone: true,
  imports: [
    MatIcon
  ],
  templateUrl: './action-snackbar.component.html',
  styleUrl: './action-snackbar.component.scss'
})
export class ActionSnackbarComponent {

  private readonly router = inject(Router);
  constructor(
    public snackBarRef: MatSnackBarRef<ActionSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
  ) {
  }


  dismissWithAction() {
    this.snackBarRef.dismissWithAction();
  }

  viewCart(): void {
    this.dismissWithAction();
    // Add navigation logic here
    this.router.navigate([this.data?.url])
  }

  buyNow(): void {
    this.dismissWithAction();
    // Add navigation logic here
    this.router.navigate([this.data?.url1])
  }

}
