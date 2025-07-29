import {AfterViewInit, Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[autoInputFocus]',
  standalone: true,
})
export class AutoInputFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef) {
  }

  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}
