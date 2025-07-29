import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[numberOnly]',
  standalone: true
})
export class OnlyNumberDirective {

  @Input() appOnlyNumber: boolean = true;
  @Input() minDigits: number | null = null;
  @Input() maxDigits: number | null = null;
  @Input() maxValue: number | null = null;

  private regex: RegExp = new RegExp(/^[0-9]*$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Enter'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.appOnlyNumber) {
      return;
    }

    // Allow special keys including Enter
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);

    // Check for maxDigits
    if (this.maxDigits !== null && next.length > this.maxDigits) {
      event.preventDefault();
      return;
    }

    // Check for maxValue
    if (this.maxValue !== null && parseInt(next, 10) > this.maxValue) {
      event.preventDefault();
      return;
    }

    // Allow only numbers
    if (!String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    if (!this.appOnlyNumber) {
      return;
    }

    let current: string = this.el.nativeElement.value;

    // Check for minDigits
    if (this.minDigits !== null && current.length < this.minDigits) {
      this.el.nativeElement.value = '';
      return;
    }

    // Check for maxValue
    if (this.maxValue !== null && parseInt(current, 10) > this.maxValue) {
      this.el.nativeElement.value = '';
    }
  }
}
