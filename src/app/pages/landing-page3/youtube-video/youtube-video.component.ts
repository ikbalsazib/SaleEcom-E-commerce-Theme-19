import {Component, HostListener, inject, Input, PLATFORM_ID} from '@angular/core';
import {ReloadService} from "../../../services/core/reload.service";
import {SafeUrlPipe} from "../../../shared/pipes/safe-url.pipe";
import {isPlatformBrowser, NgClass, NgIf, ViewportScroller} from "@angular/common";
import {CurrencyCtrPipe} from "../../../shared/pipes/currency.pipe";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-youtube-video',
  templateUrl: './youtube-video.component.html',
  styleUrl: './youtube-video.component.scss',
  imports: [
    SafeUrlPipe,
    NgIf,
    CurrencyCtrPipe,
    NgClass,
    TranslatePipe
  ],
  standalone: true
})
export class YoutubeVideoComponent {
  @Input() singleLandingPage: any;
  selectedMenu = 0;
  @Input() cartSaleSubTotal: any;

  imageVisible = false;
  textVisible = false;

  private readonly reloadService = inject(ReloadService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {

  }

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

  @HostListener('window:scroll')
  scrollBody() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the footer's Y offset position
      const [_, footerTop] = this.viewportScroller.getScrollPosition();
      const windowHeight = window.innerHeight;
      const footerOffsetTop = document.getElementById('video')?.offsetTop || 0;

      if (window.scrollY + windowHeight >= footerOffsetTop) {
        this.imageVisible = true;
        this.textVisible = true;
      } else {
        this.imageVisible = false;
        this.textVisible = false;
      }
    }
  }
}
