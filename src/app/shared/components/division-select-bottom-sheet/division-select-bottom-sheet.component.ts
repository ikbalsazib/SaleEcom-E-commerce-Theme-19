import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-division-select-bottom-sheet',
  templateUrl: './division-select-bottom-sheet.component.html',
  styleUrls: ['./division-select-bottom-sheet.component.scss'],
  standalone: true,
  imports: [MatListModule]
})
export class DivisionSelectBottomSheetComponent {
  public selectedDivision: string;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { options: any[], selectedDivision: string },
    private bottomSheetRef: MatBottomSheetRef<DivisionSelectBottomSheetComponent>
  ) {
    this.selectedDivision = data.selectedDivision;
  }

  select(option: any) {
    this.bottomSheetRef.dismiss(option);
  }
} 