import {Component, EventEmitter, inject, Input, Output, PLATFORM_ID} from '@angular/core';
import {LottieComponent} from 'ngx-lottie';
import {RouterLink} from '@angular/router';
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-empty-data',
  standalone: true,
  imports: [LottieComponent, RouterLink],
  templateUrl: './empty-data.component.html',
  styleUrl: './empty-data.component.scss',
})
export class EmptyDataComponent {

  @Input() needBorder: boolean = true;
  @Input() iconWidth: string = '200px';
  @Input() btnTitle: string = null;
  @Input() btnUrl: string = '/';
  @Input() title: string = 'No Data Found!';
  @Input() desc: string = null;
  @Input() titleSize: string = '20px';
  @Input() filePath: string = '/lottie/no-data-1.json';
  @Output() btnClick = new EventEmitter<void>();

  // Inject
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly isPlatformBrowser = isPlatformBrowser;

  onBtnClick() {
    this.btnClick.emit();
  }
}
