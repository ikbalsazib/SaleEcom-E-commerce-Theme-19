import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Coupon} from "../../../interfaces/common/coupon.interface";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-coupon-card',
  templateUrl: './coupon-card.component.html',
  styleUrl: './coupon-card.component.scss',
  imports: [
    DatePipe
  ],
  standalone: true,
  providers: [DatePipe]
})
export class CouponCardComponent {
  @Input() data!: Coupon;
  @Output() onChangeCouponCode = new EventEmitter<Coupon>();
  couponCode: any = null;
  selectedCouponId: any = null;


  selectCoupon(data: any) {

    this.couponCode = data?.couponCode;
    this.selectedCouponId = data?._id;
    this.onChangeCouponCode.emit(data?.couponCode)


  }

}
