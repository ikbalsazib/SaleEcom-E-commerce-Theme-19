import {Directive, ElementRef, EventEmitter, Inject, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';

@Directive({
  selector: '[lazyLoadComponent]',
  standalone: true
})
export class LazyLoadComponentDirective implements OnInit {

  @Output() lazyLoad: EventEmitter<any> = new EventEmitter();

  // Check Browser & Server
  isBrowser: boolean;
  isServer: boolean;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isServer = isPlatformServer(platformId);
  }

  ngOnInit() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    if (this.isBrowser) {

      const observer = new IntersectionObserver(([entry], observer) => {
        if (entry.isIntersecting) {
          this.lazyLoad.emit();
          observer.disconnect();
        }
      }, options);

      observer.observe(this.elementRef.nativeElement);
    }

  }

}
