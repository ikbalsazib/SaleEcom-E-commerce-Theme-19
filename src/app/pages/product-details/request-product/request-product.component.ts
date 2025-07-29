import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {RequestProductsService} from "../../../services/common/request-products.service";
import {UserService} from "../../../services/common/user.service";
import {UiService} from "../../../services/core/ui.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-request-product',
  templateUrl: './request-product.component.html',
  styleUrl: './request-product.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ]
})
export class RequestProductComponent implements OnInit, OnDestroy {

  // Decorator
  @Input() product:any;
  @Output() dataToParent: EventEmitter<string> = new EventEmitter<string>();

  // Store Data
  dataForm: FormGroup;
  isPopupOpen: boolean = false;
  isLoading: boolean;

  // Inject
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  public readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly requestProductEmailService = inject(RequestProductsService);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Form Data
    this.initFormData();
  }

  /***
   * Init From Data
   * onSubmit
   */
  initFormData() {
    this.dataForm = this.fb.group({
      name: [null],
      title: [null],
      email: [null, Validators.required],
      comment: [null],
    });
  }

  onSubmit() {
    if (this.dataForm.valid) {
      const selectedItem = this.product;
      const mData = {
        ...this.dataForm.value,
        ...{
          product: selectedItem,
          customerId: this.userService?.getUserId(),
          isEmailSent : false,
        }
      }
      this.isLoading = true;
      this.addRequest(mData);
    }
  }


  /**
   * HTTP REQUEST HANDLE
   * addRequest()
   */

  private addRequest(data:any) {
    const subscription = this.requestProductEmailService.addRequestProduct(data).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.uiService.message(res.message, "success");
        this.closePopup();
        this.dataForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
      }
    })
    this.subscriptions.push(subscription)
  }

  /**
   * closePopup
   * onInputChange
   */

  closePopup() {
    this.isPopupOpen = false;
    this.onInputChange(this.isPopupOpen);
  }

  onInputChange(value: any) {
    this.dataToParent.emit(value);
  }

  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
