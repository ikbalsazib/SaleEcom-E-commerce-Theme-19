import {Directive, Input} from '@angular/core';


@Directive({
  selector: '[checkImageDefault]',
  standalone: true,
  host: {
    '[src]': 'checkPath(src)',
    '(error)': 'onError()'
  }
})
export class ImageLoadErrorDirective {


  @Input() src: string;
  public defaultImg: string = 'https://cdn.saleecom.com/upload/images/placeholder.png';
  public onError() {
    this.src = this.defaultImg;
  }
  public checkPath(src) {
    return src ? src : this.defaultImg;
  }
}
