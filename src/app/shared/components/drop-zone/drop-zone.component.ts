import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {UiService} from "../../../services/core/ui.service";
import {MAX_IMAGE_UPLOAD} from "../../../core/utils/app-data";

@Component({
  selector: 'app-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss'
})
export class DropZoneComponent {

  @Output() newItemEvent = new EventEmitter();
  @Output() onDeleteOldImage = new EventEmitter<string[]>();
  files: File[] = [];
  @Input() fileNotPicked: boolean = false;
  @Input() images: string[] = [];
  maxImageUpload: number = MAX_IMAGE_UPLOAD;

  // Inject
  private readonly uiService = inject(UiService);



  /**
   * IMAGE DRUG & DROP
   * onSelect()
   * onRemove()
   */
  onSelect(event: { addedFiles: any; }) {
    if (event?.addedFiles?.length> this.maxImageUpload) {
      this.uiService.message(`Maximum ${this.maxImageUpload} images can be uploaded`, 'warn');
    } else {
      this.files.push(...event.addedFiles);
      this.newItemEvent.emit(this.files);
    }
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
    this.newItemEvent.emit(this.files);
  }

  removeOldImage(index: number) {
    this.images.splice(index, 1);
    this.onDeleteOldImage.emit(this.images);
  }
}

