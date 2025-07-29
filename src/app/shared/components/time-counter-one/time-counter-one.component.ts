import {Component, inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-time-counter-one',
  templateUrl: './time-counter-one.component.html',
  styleUrl: './time-counter-one.component.scss',
  standalone: true
})
export class TimeCounterOneComponent implements  OnInit {
  // Decorator
  @Input() endDate: any

  // Store Data
  days: any;
  hours: any;
  min: any;
  sec: any;
  result: any;

  // Inject
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      setInterval(() => {
        this.setTimer();
      }, 1000)
    }

  }

  setTimer() {
    var dest = new Date(this.endDate).getTime();
    var now = new Date().getTime();
    var diff = dest - now;
    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.sec = Math.floor((diff % (1000 * 60)) / 1000);

    if (this.days < 10) {
      this.days = '0' + this.days;
    }
    if (this.hours < 10) {
      this.hours = '0' + this.hours;
    }
    if (this.min < 10) {
      this.min = '0' + this.min;
    }
    if (this.sec < 10) {
      this.sec = "0" + this.sec;
    }

    this.result = `${this.days} : ${this.hours} : ${this.min} : ${this.sec}`;
  }

}
