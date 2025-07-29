import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {Blog} from "../../../interfaces/common/blog.interface";
import {BlogService} from "../../../services/common/blog.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {AppConfigService} from "../../../services/core/app-config.service";
import {Subscription} from "rxjs";
import {ThemeViewSetting} from "../../../interfaces/common/setting.interface";
import {BlogCardOneComponent} from "../../../shared/components/blog-cards/blog-card-one/blog-card-one.component";
import {RouterLink} from "@angular/router";
import {ProductCardLoaderComponent} from "../../../shared/loader/product-card-loader/product-card-loader.component";

@Component({
  selector: 'app-related-blog',
  templateUrl: './related-blog.component.html',
  styleUrl: './related-blog.component.scss',
  imports: [
    BlogCardOneComponent,
    RouterLink,
    ProductCardLoaderComponent
  ],
  standalone: true
})
export class RelatedBlogComponent implements OnInit, OnDestroy {
  @Input() slug: string;

  // Store Data
  blogs: Blog[] = [];

  isLoading: boolean = true;
  blogCardViews= 'Blog Card 1';
  visibleProducts= 3;

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
        // this.blogs = res.data;
        if (res.data && res.data.length) {
          this.blogs = res.data.filter(f => f.slug !== this.slug);
        }
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
