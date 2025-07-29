import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-complain',
  templateUrl: './complain.component.html',
  styleUrl: './complain.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButton
  ]
})
export class ComplainComponent implements OnInit {

  // Form Data
  formGroup: FormGroup;

  // Inject
  private readonly fb = inject(FormBuilder)

  ngOnInit() {
    // Init Data
    this.initForm();
  }

  initForm() {
    this.formGroup = this.fb.group({
      name: [null, Validators.required],
      phone: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      subject: [null, Validators.required],
      id: [null, Validators.required],
      details: [null, Validators.required]
    });
  }

  onSubmit(){
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
  }

}


