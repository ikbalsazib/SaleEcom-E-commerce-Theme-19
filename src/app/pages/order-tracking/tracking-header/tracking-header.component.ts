import {Component, Input} from '@angular/core';
import {Order} from "../../../interfaces/common/order.interface";
import {MobileHeaderComponent} from "../../../shared/components/core/mobile-header/mobile-header.component";

@Component({
  selector: 'app-tracking-header',
  templateUrl: './tracking-header.component.html',
  styleUrl: './tracking-header.component.scss',
  standalone: true,
  imports: [
    MobileHeaderComponent
  ]
})
export class TrackingHeaderComponent {

  // Decorator
  @Input() order: Order | null = null;
}
