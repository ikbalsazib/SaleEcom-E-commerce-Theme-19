import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { Blog } from "../../../interfaces/common/blog.interface";
import { ThemeViewSetting } from "../../../interfaces/common/setting.interface";
import { BlogService } from "../../../services/common/blog.service";
import { AppConfigService } from "../../../services/core/app-config.service";
import { BlogCardOneComponent } from "../../../shared/components/blog-cards/blog-card-one/blog-card-one.component";
import { SwiperComponent } from "../../../shared/components/swiper/swiper.component";
import { ProductCardLoaderComponent } from "../../../shared/loader/product-card-loader/product-card-loader.component";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    BlogCardOneComponent,
    ProductCardLoaderComponent,
    SwiperComponent
  ]
})
export class BlogComponent implements OnInit, OnDestroy {
  // Store Data
  blogs: Blog[] = [];

  isLoading: boolean = true;
  blogCardViews= 'Blog Card 1';
  visibleProducts= 6; // Show more items in swiper since it's scrollable

  // Swiper breakpoints configuration
  breakpoints = {
    1200: { slidesPerView: 3, spaceBetween: 20 },
    992: { slidesPerView: 3, spaceBetween: 15 },
    768: { slidesPerView: 2, spaceBetween: 15 },
    0: { slidesPerView: 1, spaceBetween: 10 }
  };

  // Inject
  private readonly blogService = inject(BlogService);
  protected readonly breakpointObserver = inject(BreakpointObserver);
  private readonly appConfigService = inject(AppConfigService);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Theme Settings Handle
    this.getSettingData();

    // Base Data
    this.getAllBlog();
  }

  /**
   * HTTP Request Handle
   * getAllBlog()
   **/
  private getAllBlog() {
    const subscription = this.blogService.getAllBlogs().subscribe({
      next: (res) => {
        this.blogs = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * FORM METHODS
   * getSettingData()
   **/
  private getSettingData() {
    const themeViewSettings: ThemeViewSetting[] =
      this.appConfigService.getSettingData('themeViewSettings');
    // this.categoryViews = themeViewSettings
    //   .find((f) => f.type == 'categoryViews')
    //   .value.join();
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach((sub) => sub?.unsubscribe());
  }
}

