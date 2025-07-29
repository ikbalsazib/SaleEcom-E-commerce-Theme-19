import {Component, Input, OnInit} from '@angular/core';
import {CurrencyCtrPipe} from "../../pipes/currency.pipe";
import {DatePipe, NgClass, TitleCasePipe} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-track-single-order',
  standalone: true,
  imports: [
    CurrencyCtrPipe,
    DatePipe,
    TitleCasePipe,
    RouterLink,
    NgClass
  ],
  templateUrl: './track-single-order.component.html',
  styleUrl: './track-single-order.component.scss'
})
export class TrackSingleOrderComponent implements OnInit {
  @Input() inputData!: any;

  ngOnInit(){
    console.log("inputData", this.inputData);
  }
}
