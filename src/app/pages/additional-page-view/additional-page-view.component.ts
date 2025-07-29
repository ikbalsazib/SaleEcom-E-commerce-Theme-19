import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {AdditionalPageService} from "../../services/common/additional-page.service";
import {SafeHtmlCustomPipe} from "../../shared/pipes/safe-html.pipe";

@Component({
  selector: 'app-additional-page-view',
  templateUrl: './additional-page-view.component.html',
  styleUrl: './additional-page-view.component.scss',
  standalone: true,
  imports: [
    SafeHtmlCustomPipe
  ]
})
export class AdditionalPageViewComponent implements OnInit, OnDestroy {

  // Store Data
  slug: string = null;
  pageInfo: any = '';
  msg = '';

  // Inject
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly additionalPageService = inject(AdditionalPageService);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {

    const subscription = this.activatedRoute.paramMap.subscribe(param => {
      this.slug = param.get('pageSlug');
      this.getPageInfo();
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * HTTP REQ HANDLE
   * getPageInfo()
   */

  private getPageInfo() {
    const subscription = this.additionalPageService.getAdditionalPageBySlug(this.slug)
      .subscribe({
        next: (res => {
          this.pageInfo = res.data;
          // if (!this.pageInfo) {
          //   this.msg = '<h2>Coming Soon!</h2>'
          // }
        }),
        error: (error => {
          console.log(error);
        })
      });
    this.subscriptions?.push(subscription);
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
