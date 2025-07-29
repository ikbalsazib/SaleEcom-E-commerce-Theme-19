import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeCounterTwoComponent } from './time-counter-two.component';


@NgModule({
  declarations: [
    TimeCounterTwoComponent
  ],
  imports: [
    CommonModule,
  ],
  exports:[
    TimeCounterTwoComponent
  ]
})
export class TimeCounterTwoModule { }
