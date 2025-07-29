import {Component, Input} from '@angular/core';
import {Product} from "../../../interfaces/common/product.interface";

@Component({
  selector: 'app-product-description',
  standalone: true,
  imports: [],
  templateUrl: './product-description.component.html',
  styleUrl: './product-description.component.scss'
})
export class ProductDescriptionComponent {
  @Input() data:Product;
  isShow: boolean = false;

  handleToggle(){
    this.isShow = !this.isShow;
  }
}

