import {Component, inject, Inject } from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {Router} from "@angular/router";
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  standalone: true,
  imports: [
    CurrencyCtrPipe,
    TranslatePipe
  ],
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {

  // Inject
  private readonly router = inject(Router);

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<OrderSummaryComponent>
  ) {}

  closeBottomSheet(): void {
    this.bottomSheetRef.dismiss();
  }

  isLoggin() {
      this.router.navigate(['/checkout']);
      this.bottomSheetRef.dismiss();
  }

}
