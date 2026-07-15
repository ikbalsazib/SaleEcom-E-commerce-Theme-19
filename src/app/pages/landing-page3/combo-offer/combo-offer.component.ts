import {Component, inject, Input, PLATFORM_ID} from '@angular/core';
import {ReloadService} from "../../../services/core/reload.service";
import {ViewportScroller} from "@angular/common";

@Component({
  selector: 'app-combo-offer',
  templateUrl: './combo-offer.component.html',
  styleUrl: './combo-offer.component.scss',
  standalone: true
})
export class ComboOfferComponent {
  @Input() singleLandingPage: any;
  selectedMenu = 0;

  private readonly reloadService = inject(ReloadService);

  /**
   * SCROLL WITH NAVIGATE
   * onScrollWithNavigate()
   */

  public onScrollWithNavigate(type: string) {
    switch (true) {
      case type === "payment":
        this.selectedMenu = 1;
        this.reloadService.needRefreshSticky$(true);
        break;
      default:
        this.selectedMenu = 0;
    }
  }
}
