import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';


@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {





  constructor(protected sanitizer: DomSanitizer) {
  }

  public transform(value: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value)
  }


}
