import {Component, Inject, inject, OnInit, PLATFORM_ID} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {isPlatformBrowser} from "@angular/common";
import {ImageCroppedEvent, ImageCropperComponent} from "ngx-image-cropper";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrl: './image-crop.component.scss',
  standalone: true,
  imports: [
    MatProgressSpinner,
    ImageCropperComponent,
    MatButton
  ]
})
export class ImageCropComponent implements OnInit {

  // Store Data
  isLoaded: boolean = false;
  imageChangedEvent: any = null;
  croppedImage?: string | null | undefined = null;
  imgBlob: any;
  isBrowser: boolean;

  // Inject
  private platformId = inject(PLATFORM_ID)

  constructor(
    public dialogRef: MatDialogRef<ImageCropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.data) {
      this.imageChangedEvent = this.data;
    }
  }

  /**
   * imageCropped
   * loadImageFailed
   * cropperReady
   * onCloseDialogue
   * onSaveImage
   */

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
    this.imgBlob = event.blob;
  }

  loadImageFailed() {
    this.isLoaded = false;
  }

  cropperReady() {
    this.isLoaded = true;
  }

  onCloseDialogue() {
    this.dialogRef.close();
  }

  onSaveImage() {
    this.dialogRef.close({
      imgBlob: this.imgBlob ? this.imgBlob : null,
      croppedImage: this.croppedImage ? this.croppedImage : null,
    });
  }
}
