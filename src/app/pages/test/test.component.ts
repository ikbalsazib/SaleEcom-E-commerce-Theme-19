import {Component} from '@angular/core';
import {MatDialogModule} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {CustomSliderTestComponent} from "./custom-slider-test/custom-slider-test.component";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButton,
    CustomSliderTestComponent,
  ]
})
export class TestComponent {
}
