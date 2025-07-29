import {Component, inject, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-compare-view',
  templateUrl: './compare-view.component.html',
  styleUrl: './compare-view.component.scss'
})
export class CompareViewComponent implements  OnInit{

  constructor(
    public dialogRef: MatDialogRef<CompareViewComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
  )
  {}

  ngOnInit(): void {
  }

  /**
   * onConfirm
   * onDismiss
   */
  onConfirm(): void {
    this.dialogRef.close(true);
    this.router.navigate(['/compare-list']);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}
