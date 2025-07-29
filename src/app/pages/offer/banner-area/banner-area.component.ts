import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SafeUrlPipe} from "../../../shared/pipes/safe-url.pipe";
import {SafeHtmlCustomPipe} from "../../../shared/pipes/safe-html.pipe";

@Component({
  selector: 'app-banner-area',
  templateUrl: './banner-area.component.html',
  standalone: true,
  imports: [
    SafeUrlPipe,
    SafeHtmlCustomPipe
  ],
  styleUrl: './banner-area.component.scss'
})
export class BannerAreaComponent implements  OnChanges {

  // Decorator
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges) {
  }

  getEmbeddedLink(youtubeUrl) {
   if(youtubeUrl){
     if (!youtubeUrl?.includes("youtube.com/watch?v=")) {
      return "Invalid YouTube URL";
    }
    const videoId = youtubeUrl?.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
   }else {
     return '';
   }
  }

}
