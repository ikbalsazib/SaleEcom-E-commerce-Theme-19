import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {RouterModule} from "@angular/router";
import {Popup} from '../../../interfaces/common/popup.interface';

@Component({
  selector: 'app-popup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './popup-dialog.component.html',
  styleUrl: './popup-dialog.component.scss'
})
export class PopupDialogComponent implements OnInit {

  popup: Popup;

  constructor(
    private dialogRef: MatDialogRef<PopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Popup,
  ) {
  }

  ngOnInit(): void {
    this.popup = this.data;
  }


  onClose() {
    this.dialogRef.close();
  }
}
