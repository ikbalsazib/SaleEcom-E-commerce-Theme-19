import { CommonModule } from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CurrencyCtrPipe} from '../../pipes/currency.pipe';

@Component({
  selector: 'app-single-order',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyCtrPipe],
  templateUrl: './single-order.component.html',
  styleUrl: './single-order.component.scss',
})
export class SingleOrderComponent implements OnInit {
  @Input() inputData!: any;

  ngOnInit(){
  }


  getProductImage(item: any): string {
    return item?.variation?.image || item?.image || 'https://cdn.saleecom.com/upload/images/placeholder.png';
  }
}
