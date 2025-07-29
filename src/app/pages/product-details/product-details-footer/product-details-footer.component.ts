import {Component, inject, Input} from '@angular/core';
import { RouterLink } from '@angular/router';
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {AddToCartComponent} from "../add-to-cart/add-to-cart.component";
import {BuyModalComponent} from "../buy-modal/buy-modal.component";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-product-details-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './product-details-footer.component.html',
  styleUrl: './product-details-footer.component.scss',
})
export class ProductDetailsFooterComponent {

  // Decorator
  @Input() product:any;
  @Input() isVisible: boolean = true;

  // Inject
  private readonly bottomSheet = inject(MatBottomSheet);

  openBottomSheet(type:any): void {
    if(type=== 'buy-now'){
      this.bottomSheet.open(BuyModalComponent, {
        data: { product: this.product }
      });
    }else{
      this.bottomSheet.open(AddToCartComponent, {
        data: { product: this.product }
      });
    }
  }


}
