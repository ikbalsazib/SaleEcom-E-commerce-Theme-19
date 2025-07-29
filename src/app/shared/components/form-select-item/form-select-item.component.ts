import {Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-form-select-item',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './form-select-item.component.html',
  styleUrl: './form-select-item.component.scss'
})
export class FormSelectItemComponent {

  // Dynamic Component Data
  @Input('controlName') controlName: FormControl;
  @Input('label') label: string = 'Enter';
  @Input('required') required: boolean = false;
  @Input('touched') touched: boolean = false;
  @Input('invalid') invalid: boolean = false;
  @Input('inputErrorMsg') inputErrorMsg: string = 'This field is required';
  @Input('data') data: any[] = [];


}
