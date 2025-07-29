import {Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {NoWhitespaceDirective} from '../../directives/no-whitespace.directive';

@Component({
  selector: 'app-form-input-item',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NoWhitespaceDirective
  ],
  templateUrl: './form-input-item.component.html',
  styleUrl: './form-input-item.component.scss'
})
export class FormInputItemComponent {

  // Dynamic Component Data
  @Input('controlName') controlName: FormControl;
  @Input('label') label: string = '';
  @Input('type') type: 'text' | 'number' | 'tel' | 'password' = 'text';
  @Input('required') required: boolean = false;
  @Input('placeholder') placeholder: string = 'Enter here';
  @Input('touched') touched: boolean = false;
  @Input('invalid') invalid: boolean = false;
  @Input('enableSlug') enableSlug: boolean = false;
  @Input('inputErrorMsg') inputErrorMsg: string = 'This field is required';


}
