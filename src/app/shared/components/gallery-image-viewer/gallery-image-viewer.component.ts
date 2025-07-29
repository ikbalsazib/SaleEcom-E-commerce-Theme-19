import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';

@Component({
  selector: 'app-gallery-image-viewer',
  standalone: true,
  imports: [
  ],
  templateUrl: './gallery-image-viewer.component.html',
  styleUrl: './gallery-image-viewer.component.scss'
})
export class GalleryImageViewerComponent implements OnChanges {
  // Image Zoom & View Area
  @ViewChild('zoomViewer', {static: false}) zoomViewer;
  // Decorator
  @Input() images: string[] = [];
  @Input() startIndex: number | undefined;
  @Output() closeEvent = new EventEmitter<void>();

  // Store Data
  currentIndex: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startIndex'] && this.startIndex !== undefined && this.images.length > 0) {
      this.setIndex(this.startIndex);
    }
  }

  /**
   * Other Methods
   * setIndex()
   * prevImage()
   * nextImage()
   * close()
   */
  setIndex(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
    } else {
      this.currentIndex = 0;
    }
  }

  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.images.length - 1;
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  close(): void {
    this.closeEvent.emit();
  }


  public onMouseMove(e) {
    if (window.innerWidth >= 1099) {
      const image = e.currentTarget;
      const offsetX = e.offsetX;
      const offsetY = e.offsetY;
      const x = offsetX / image.offsetWidth * 120;
      const y = offsetY / image.offsetHeight * 120;
      const zoom = this.zoomViewer.nativeElement;
      if (zoom) {
        zoom.style.transformOrigin = (x) + '% ' + (y) + '%';
        zoom.style.transform = 'scale(1.7)'
        zoom.style.display = 'block';
        zoom.style.height = `${image.height}px`;
        zoom.style.width = `${image.width + 0}px`;
        zoom.style.borderRadius='5px'
      }
    }
  }

  public onMouseLeave(event) {
    var zoom = this.zoomViewer.nativeElement;
    if(zoom){
      zoom.style.objectPosition= 'inherit';
      zoom.style.transform = 'scale(1)';
    }
  }
}
