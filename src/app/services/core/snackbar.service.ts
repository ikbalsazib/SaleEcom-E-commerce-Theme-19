import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  // Inject
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Method to open a simple Snackbar
   */
  open(message: string, action: string = 'Close', duration: number = 3000) {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
