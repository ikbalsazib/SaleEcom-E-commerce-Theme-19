import {Directive, ElementRef, Input} from '@angular/core';


@Directive({
  selector: '[appLazyLoad]',
  standalone: true,

})
export class ImageLazyLoadDirective {
  @Input() appLazyLoad!: string;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const imgElement = this.el.nativeElement as HTMLImageElement;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            imgElement.src = this.appLazyLoad;
            observer.unobserve(imgElement);
          }
        });
      });
      observer.observe(imgElement);
    } else {
      imgElement.src = this.appLazyLoad; // Fallback
    }
  }
}
