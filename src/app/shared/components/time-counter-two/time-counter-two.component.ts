import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {UtilsService} from '../../../services/core/utils.service';

@Component({
  selector: 'app-time-counter-two',
  templateUrl: './time-counter-two.component.html',
  styleUrls: ['./time-counter-two.component.scss']
})
export class TimeCounterTwoComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  @Input() endDate: any;


  days: any;
  hours: any;
  min: any;
  sec: any;
  result: any;

  timeLeft = 0;

  public dateNow = new Date();
  public dDay: Date;

  constructor(
    private utilsService: UtilsService
  ) {
  }

  ngOnInit() {
    setInterval(() => {
      this.setTimer();
    }, 1000);
  }


  setTimer() {
    var dest = new Date(this.endDate).getTime();
    var now = new Date().getTime();
    var diff = dest - now;
    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.sec = Math.floor((diff % (1000 * 60)) / 1000);

    /**
     * Some Condition
     */
    if (this.days < 10) {
      this.days = '0' + this.days;
    }
    if (this.hours < 10) {
      this.hours = "0" + this.hours;
    }
    if (this.min < 10) {
      this.min = "0" + this.min;
    }
    if (this.sec < 10) {
      this.sec = "0" + this.sec;
    }/* condition end */
    /*  Result */
    this.result = `${this.days} : ${this.hours} : ${this.min} : ${this.sec}`;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

  }
}
