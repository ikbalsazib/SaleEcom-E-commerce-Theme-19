import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {BannerService} from '../../../../services/common/banner.service';
import {Banner} from '../../../../interfaces/common/banner.interface';
import {FilterData} from '../../../../interfaces/core/filter-data';
import {NgClass} from '@angular/common';
import {
  BannerAdvertiseLoaderComponent
} from '../../../loader/banner-advertise-loader/banner-advertise-loader.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-small-advertise',
  templateUrl: './small-advertise.component.html',
  styleUrl: './small-advertise.component.scss',
  imports: [
    NgClass,
    BannerAdvertiseLoaderComponent,
    RouterLink
  ],
  standalone: true
})
export class SmallAdvertiseComponent implements OnInit, OnDestroy {

  // Store Data
  banners: Banner[] = [];
  isLoading: boolean = true;

  // Inject
  private readonly bannerService = inject(BannerService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Base Data
    this.getAllBanner();
  }


  /**
   * HTTP Request Handle
   * getAllBanner()
   */
  private getAllBanner(): void {
    const filterData: FilterData = {
      filter: {type: 'home-page-top-banner', status: 'publish'},
      pagination: null,
      select: {
        name: 1,
        type: 1,
        images: 1,
      },
      sort: {priority: -1}
    };

    const subscription = this.bannerService.getAllBanner(filterData, null).subscribe({
        next: res => {
          this.banners = res.data;
          this.isLoading = false;
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
        }
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
