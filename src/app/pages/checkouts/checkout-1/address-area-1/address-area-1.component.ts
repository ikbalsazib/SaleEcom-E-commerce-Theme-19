import {Component, EventEmitter, HostListener, inject, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UiService} from "../../../../services/core/ui.service";
import {UserDataService} from "../../../../services/common/user-data.service";
import {Subscription} from "rxjs";
import {AddAddressComponent} from "../../../../shared/components/add-address/add-address.component";
import {ADDRESS_MAX_CAPACITY} from '../../../../core/utils/app-data';
import {UserAddress} from '../../../../interfaces/common/user.interface';
import {ReloadService} from '../../../../services/core/reload.service';
import {NgClass, TitleCasePipe} from "@angular/common";

@Component({
  selector: 'app-address-area-1',
  templateUrl: './address-area-1.component.html',
  standalone: true,
  imports: [
    NgClass,
    TitleCasePipe
  ],
  styleUrl: './address-area-1.component.scss'
})
export class AddressArea1Component implements OnInit, OnDestroy {

  // Decorator
  @Output() onChangeAddress = new EventEmitter<UserAddress>();

  // Store Data
  addresses: UserAddress[] = [];
  protected readonly addressMaxCapacity = ADDRESS_MAX_CAPACITY;
  showCancelPopup: boolean = false;
  cancellationReason: string = '';
  isSmallScreen: boolean = window.innerWidth <= 600;

  // Inject
  private readonly dialog = inject(MatDialog);
  private readonly uiService = inject(UiService);
  private readonly userDataService = inject(UserDataService);
  private readonly reloadService = inject(ReloadService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Query Param Data for Manage Dialog
    const subscription2 = this.activatedRoute.queryParamMap.subscribe(qParam => {
      if (qParam.get('dialogOpen') && qParam.get('dialogOpen') === 'true') {
      } else {
        this.dialog.closeAll();
      }
    });
    this.subscriptions?.push(subscription2);

    // Base Data
    this.getUserAddress();
  }


  /**
   * HTTP Req Handle
   * getUserAddress()
   * deleteAddressById()
   * updateAddress()
   * setDefaultAddress()
   */
  private getUserAddress() {
    const subscription = this.userDataService.getUserAddress().subscribe({
      next: res => {
        this.addresses = res.data;
        this.emitSelectedAddress();
      },
      error: err => {
        console.log(err);
      }
    });
    this.subscriptions?.push(subscription);
  }

  public deleteAddressById(event: any, id: string) {
    event.stopPropagation();
    // Remove Locally
    this.addresses = this.addresses.filter(item => item._id !== id);

    const subscription = this.userDataService.deleteAddressById(id).subscribe({
      next: res => {
        if (res) {
          // Update Delivery Charge With Address
          this.reloadService.needRefreshDeliveryCharge$();
          this.emitSelectedAddress();
          this.uiService.message(res.message, "success");
        }
      },
      error: err => {
        console.log(err);
      }
    });
    this.subscriptions?.push(subscription);
  }


  private updateAddress(id: string, data: any) {
    // Update Locally
    const fIndex = this.addresses.findIndex(f => f._id === id);
    this.addresses[fIndex].isDefaultAddress = true;

    const subscription = this.userDataService.editAddress(id, data).subscribe({
      next: res => {
        if (res) {
          this.uiService.message(res.message, "success");
          this.reloadService.needRefreshDeliveryCharge$();
          // Update Delivery Charge With Address
          this.emitSelectedAddress();
        }
      },
      error: err => {
        console.log(err);
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * FOR MATERIAL POPUP FUNCTION
   * openAddressDialog()
   */
  openAddressDialog(event: any, data?: any) {
    event.stopPropagation();
    event.stopPropagation();
    this.router.navigate([], {queryParams: {dialogOpen: true}, queryParamsHandling: 'merge'}).then();
    const dialogRef = this.dialog.open(AddAddressComponent, {
      data: data,
      maxWidth: "700px",
      width: "100%",
      height: "auto",
      panelClass: ['dialog', 'add-address']
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      this.router.navigate([], {queryParams: {dialogOpen: null}, queryParamsHandling: 'merge'}).then();
      if (dialogResult && dialogResult.data) {
        if (!data) {
          this.addresses.unshift(dialogResult.data);
          // Update Instant with Local Logic
          this.setLocalIsDefaultAddress(dialogResult.data);
        } else {
          const fIndex = this.addresses.findIndex(f => f._id === dialogResult.data._id);
          this.addresses[fIndex] = dialogResult.data;
          // Update Instant with Local Logic
          this.setLocalIsDefaultAddress(dialogResult.data);
        }
        this.reloadService.needRefreshDeliveryCharge$();
        // Update Delivery Charge With Address
        this.emitSelectedAddress();

      }
    });

  }

  openCancelPopup(event: any) {
    event.stopPropagation();
    this.showCancelPopup = true;
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
    this.cancellationReason = '';
  }


  /**
   * Ui Logic
   * onChangeDefaultAddress()
   * setLocalIsDefaultAddress()
   * updateDeliveryCharge()
   */

  onChangeDefaultAddress(data: UserAddress) {
    // Update Instant with Local Logic
    this.setLocalIsDefaultAddress(data);
    // Call Api
    this.updateAddress(data._id, {...data, ...{isDefaultAddress: true}});
  }

  private setLocalIsDefaultAddress(data: UserAddress) {
    const fIndex = this.addresses.findIndex(f => f._id === data._id);
    this.addresses[fIndex].isDefaultAddress = true;
    this.addresses.forEach((f, index) => {
      if (index !== fIndex) {
        f.isDefaultAddress = false;
      }
    });
  }

  emitSelectedAddress() {
    if (this.addresses.length) {
      const defaultAddress = this.addresses.find(f => f.isDefaultAddress);
      this.onChangeAddress.emit(defaultAddress);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isSmallScreen = window.innerWidth <= 600;
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
