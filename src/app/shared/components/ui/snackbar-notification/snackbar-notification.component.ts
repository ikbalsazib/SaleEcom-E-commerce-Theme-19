import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-snackbar-notification',
  templateUrl: './snackbar-notification.component.html',
  styleUrls: ['./snackbar-notification.component.scss'],
  imports: [
    MatButtonModule,
    MatProgressBarModule
  ],
  standalone: true
})
export class SnackbarNotificationComponent implements OnDestroy {

  progress = 100;
  private currentIntervalId: NodeJS.Timeout;

  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarNotificationComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: string
  ) {
    this.snackBarRef.afterOpened()
      .subscribe({
        next: () => {
          const duration = this.snackBarRef.containerInstance.snackBarConfig.duration;
          this.runProgressBar(duration);
        },
        error: err => {
          console.log(err)
        }
      });
  }


  dismissWithAction() {
    this.cleanProgressBarInterval();
    this.snackBarRef.dismissWithAction();
  }

  /**
   * Countdown
   * runProgressBar()
   * cleanProgressBarInterval()
   */
  private runProgressBar(duration: number) {
    const startNumber = 120;
    const endNumber = 0;
    const numberOfSteps = startNumber - endNumber;
    const intervalTime = duration / numberOfSteps;
    let currentNumber = startNumber;
    const decreaseNumber = () => {
      if (currentNumber >= endNumber) {
        this.progress--;
        if (this.progress < 0) {
          this.cleanProgressBarInterval();
        }
      }
    }
    this.currentIntervalId = setInterval(decreaseNumber, intervalTime);
    setTimeout(() => {
      clearInterval(this.currentIntervalId);
    }, duration);
  }

  cleanProgressBarInterval() {
    clearInterval(this.currentIntervalId);
  }

  ngOnDestroy() {
    this.cleanProgressBarInterval();
  }

}
