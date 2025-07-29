import { NgModule } from '@angular/core';
import { DropZoneComponent } from './drop-zone.component';
import {NgxDropzoneModule} from "ngx-dropzone";
import {MatIconButton} from "@angular/material/button";



@NgModule({
  declarations: [
    DropZoneComponent
  ],
  imports: [
    NgxDropzoneModule,
    MatIconButton
  ],
  exports: [
    DropZoneComponent
  ]
})
export class DropZoneModule { }
