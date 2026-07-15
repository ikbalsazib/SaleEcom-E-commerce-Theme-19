import {Component, inject, Input} from '@angular/core';
import {ReloadService} from "../../../services/core/reload.service";
import {NgIf} from "@angular/common";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-why-best',
  templateUrl: './why-best.component.html',
  styleUrl: './why-best.component.scss',
  imports: [
    NgIf,
    TranslatePipe
  ],
  standalone: true
})
export class WhyBestComponent {
  @Input() singleLandingPage: any;

  selectedMenu = 0;
  @Input() cartSaleSubTotal: any;


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
