import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  templateUrl: './otp-input.component.html',
  imports: [
    ReactiveFormsModule,
    NgClass
  ],
  styleUrls: ['./otp-input.component.scss']
})
export class OtpInputComponent implements OnInit, OnChanges {
  @Input() isInvalid: boolean = false;
  @Output() onFinalInput = new EventEmitter<string>();
  otpForm!: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.otpForm = this.fb.group({
      otp0: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp3: ['', [Validators.required, Validators.pattern('^[0-9]$')]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isInvalid) {
      this.otpForm.invalid;
      this.otpForm.markAllAsTouched();

    }
  }

  moveToNext(event: any, index: number) {
    const input = event.target;
    const nextInput = this.getOtpControl(index + 1);

    if (input.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const prevInput = this.getOtpControl(index - 1);
    const nextInput = this.getOtpControl(index + 1);

    if (event.key === 'Backspace') {
      if (input.value.length === 0 && prevInput) {
        prevInput.focus();
        this.otpForm.get(`otp${index - 1}`)?.setValue('');
      } else {
        this.otpForm.get(`otp${index}`)?.setValue('');
      }
    } else if (event.key !== 'Tab' && nextInput && input.value.length === 1) {
      nextInput.focus();
    }
  }

  pasteOTP(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text/plain') || '';
    const otpArray = pasteData.split('').slice(0, 4);

    otpArray.forEach((value, index) => {
      this.otpForm.get(`otp${index}`)?.setValue(value);
    });

    this.checkOtpComplete();
  }

  onInputChange(event: any, index: number) {
    this.moveToNext(event, index);
    this.checkOtpComplete();
  }

  checkOtpComplete() {
    if (this.otpForm.valid) {
      const otp = Object.values(this.otpForm.value).join('');
      this.onOtpComplete(otp);
    }
  }

  onOtpComplete(otp: string) {
    this.onFinalInput.emit(otp);
  }

  getOtpControl(index: number): HTMLInputElement | null {
    return this.otpForm.get(`otp${index}`) ? document.getElementById(`otp${index}`) as HTMLInputElement : null;
  }
}
