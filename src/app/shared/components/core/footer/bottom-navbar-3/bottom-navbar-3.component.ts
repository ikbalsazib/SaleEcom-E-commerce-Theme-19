import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ShopInformation } from '../../../../../interfaces/common/shop-information.interface';
import { NgClass } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { ProductService } from '../../../../../services/common/product.service';
import { TagService } from '../../../../../services/common/tag.service';
import { AppConfigService } from '../../../../../services/core/app-config.service';
import { NavigationService } from '../../../../../services/core/navigation.service';

@Component({
  selector: 'app-bottom-navbar-3',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './bottom-navbar-3.component.html',
  styleUrl: './bottom-navbar-3.component.scss'
})
export class BottomNavbar3Component {
  // Decorator
  @Input() currentUrl: string;
  @Input() shopInfo: ShopInformation;
  @Input() chatLink: any;
  @Input() tag: any;
  @Input() index: number = 0;
  @Input() tags: any[]; // Receive tags from parent for dynamic menu
  private observer!: IntersectionObserver;

  products: any[] = [];
  private subscriptions: Subscription[] = [];
  // Store Data
  isLoading: boolean = true;
  chatStyle: boolean = false;
  activeNav: string = 'home';

  private readonly productService = inject(ProductService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private readonly tagService = inject(TagService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly navigationService = inject(NavigationService);

  //  private readonly appConfigService = inject(AppConfigService);
  // private readonly navigationService = inject(NavigationService);
  /**
   * Other Methods
   * isVisible
   * getSocialLink()
   * onClick()
   * chatOpen()
   **/

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for SSR - Load without intersection
      this.loadProducts();
    }
    // Set Home as active if currentUrl is '/'
    if (this.currentUrl === '/' || !this.currentUrl) {
      this.activeNav = 'home';
    }
  }

  setActiveNav(nav: string) {
    this.activeNav = nav;
  }

  isNavActive(nav: string): boolean {
    return this.activeNav === nav;
  }

  get isVisible() {
    return (
      !['/cart', '/checkout', '/easy-checkout'].includes(this.currentUrl) &&
      !this.currentUrl.startsWith('/product-details/')
    );
  }

  getSocialLink(type: string): any {
    switch (type) {
      case 'messenger':
        return this.chatLink?.find((f) => f.chatType === 'messenger') ?? null;
      case 'whatsapp':
        return this.chatLink?.find((f) => f.chatType === 'whatsapp') ?? null;
      case 'phone':
        return this.chatLink?.find((f) => f.chatType === 'phone') ?? null;
      case 'facebook':
        return this.shopInfo?.socialLinks.find(f => f.type === 0)?.value ?? null;
      default:
        return null;
    }
  }

  loadProducts() {
    const delayTime = this.index * 200; // 200ms delay per tag index
    timer(delayTime).subscribe(() => {
      // Adds a 200ms delay before loading products
      // this.getAllProducts();
      this.getAllTags();
    });
  }

  getAllTags() {
    const subscription = this.tagService.getAllTags()
      .subscribe({
        next: res => {
          this.tags = res.data;
        },
        error: (err) => {
          console.log(err)
        }
      });
    this.subscriptions?.push(subscription);
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadProducts();
          this.observer.disconnect();
        }
      });
    });
    this.observer.observe(this.el.nativeElement);
  }

  // private getAllProducts() {
  //   const subscription = this.productService
  //     .getAllProductsByUi(
  //       { status: 'publish', 'tags.name': this.tag?.name },
  //       1,
  //       6
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.products = res.data;
  //         this.isLoading = false;
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         this.isLoading = false;
  //       },
  //     });
  //   this.subscriptions.push(subscription);
  // }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.chat')) {
      this.chatStyle = false;
    }
  }

  chatOpen() {
    this.chatStyle = !this.chatStyle;
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    document.body.style.overflow = this.isSidebarOpen ? 'hidden' : 'auto';
  }
}
