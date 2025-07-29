import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Division} from "../../../interfaces/common/division.interface";
import {Area} from "../../../interfaces/common/area.interface";
import {Subscription} from "rxjs";
import {UiService} from "../../../services/core/ui.service";
import {DivisionService} from "../../../services/common/division.service";
import {AreaService} from "../../../services/common/area.service";
import {ZoneService} from "../../../services/common/zone.service";
import {UserDataService} from "../../../services/common/user-data.service";
import {ReloadService} from "../../../services/core/reload.service";
import {FilterData} from "../../../interfaces/core/filter-data";
import { Zone } from '../../../interfaces/common/zone.interface';
import {MatCheckbox} from "@angular/material/checkbox";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDialogClose} from "@angular/material/dialog";
import {UserAddress} from '../../../interfaces/common/user.interface';

@Component({
  selector: 'app-manage-address',
  templateUrl: './manage-address.component.html',
  styleUrl: './manage-address.component.scss',
  imports: [
    MatCheckbox,
    MatFormField,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInput,
    MatSelect,
    MatOption,
    MatMenu,
    MatMenuItem,
    MatDialogClose,
    TitleCasePipe,
    MatMenuTrigger
  ],
  standalone:true
})
export class ManageAddressComponent implements OnInit, OnDestroy {
  //Store Data
  dataForm!: FormGroup;
  storeAddress?: string;
  showAddressForm: boolean = false;
  addresses!: UserAddress[] | any[];

  divisions?: Division[] = [];
  area?: Area[] = [];
  zone?: Zone[] = [];
  isLoading = false;
  selectEdittedAdress: UserAddress | any = null;
  isSelected = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  private subDivisionData?: Subscription;
  private subAreaData?: Subscription;
  private subZoneData?: Subscription;
  private subForm?: Subscription;
  private subAddressData?: Subscription;
  private subReload?: Subscription;
  private subUpdateAddress?: Subscription;
  private subDeleteAddress?: Subscription;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private divisionService: DivisionService,
    private areaService: AreaService,
    private zoneService: ZoneService,
    private userDataService: UserDataService,
    private reloadService: ReloadService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getAllDivision();
    //Address
    this.subReload = this.reloadService.refreshData$.subscribe(() => {
      this.getUserAddress();
    });
    this.getUserAddress();
  }

  /**
   * INITIALIZE FORM FUNCTION
   * initForm()
   */
  initForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      phone: [null, [Validators.required, Validators.maxLength(11)]],
      division: [null, Validators.required],
      area: [null, Validators.required],
      zone: [null],
      address: [null, [Validators.required]],
      addressType: [null],
      setDefaultAddress: [false],
    });
  }

  /**
   * FORM DATA SUBMIT FUNCTION
   * onFormSubmit()
   */
  onFormSubmit() {
    if (this.dataForm.valid) {
      let selectDivision = this.divisions?.find(
        (d) => d._id === this.dataForm.value.division
      );
      let selectArea = this.area?.find(
        (d) => d._id === this.dataForm.value.area
      );
      let selectZone = this.zone?.find(
        (d) => d._id === this.dataForm.value.zone
      );
      const mData = {
        ...this.dataForm.value,
        ...{ division: selectDivision },
        ...{ area: selectArea },
        ...{ zone: selectZone },
      };
      if (mData) {
        if (this.selectEdittedAdress === null) {
          this.addAddress(mData);
        } else {
          this.updateAddress(this.selectEdittedAdress?._id, mData);
        }
      }
    } else {
      this.uiService.message('Please fill all form input',"warn");
      this.dataForm.markAllAsTouched();
    }
  }

  /***
   * HTTP REQUEST HANDLE
   * getAllDivision()
   * getAllArea()
   * getAllZone()
   * addAddress()
   * getUserAddress()
   *
   */

  private getAllDivision() {
    let mSelect = {
      name: 1,
    };
    const filter: FilterData = {
      filter: { status: 'publish' },
      select: mSelect,
      pagination: null,
      sort: { createdAt: -1 },
    };

    const subscription  = this.divisionService
      .getAllDivisions(filter)
      .subscribe(
        (res) => {
          if (res.success) {
            this.divisions = res.data;
          }
        },
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    this.subscriptions?.push(subscription);
  }

  private getAllArea(id: string) {
    const select = 'name';
    const subscription = this.areaService.getAreaByParentId(id, select).subscribe(
      (res) => {
        if (res.success) {
          this.area = res.data;
        }
      },
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    this.subscriptions?.push(subscription);
  }

  private getAllZone(id: string) {
    const select = 'name';
    const subscription  = this.zoneService.getZoneByParentId(id, select).subscribe(
      (res) => {
        if (res.success) {
          this.zone = res.data;
        }
      },
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    this.subscriptions?.push(subscription);
  }

  private addAddress(data: UserAddress | any) {
    this.isLoading = true;
    const subscription  = this.userDataService.addAddress(data).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          this.uiService.message('Address Added',"success");
          this.reloadService.needRefreshData$();
          this.showAddressForm = false;
        }
      },
      (err) => {
        if (err) {
          this.isLoading = false;
          console.log(err);
        }
      }
    );
    this.subscriptions?.push(subscription);
  }

  private getUserAddress() {
    const subscription = this.userDataService.getUserAddress().subscribe(
      (res: any) => {
        if (res.success) {
          this.addresses = res.data;
        }
      },
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    this.subscriptions?.push(subscription);
  }
  public deleteAddressById(id: string) {
    const subscription = this.userDataService
      .deleteAddressById(id)
      .subscribe(
        (res) => {
          if (res) {
            this.reloadService.needRefreshData$();
            this.uiService.message(res.message,"success");
          }
        },
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    this.subscriptions?.push(subscription);
  }

  public setDefualtAddress(id: string) {
    const data = {
      setDefaultAddress: true,
    };
    const subscription  = this.userDataService
      .editAddress(id, null)
      .subscribe(
        (res) => {
          if (res) {
            this.reloadService.needRefreshData$();
            this.uiService.message(res.message,"success");
            this.removeOthorDefualtAddress(id);
          }
        },
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    this.subscriptions?.push(subscription);
  }
  private updateAddress(id: string, data: UserAddress | any) {
    this.subUpdateAddress = this.userDataService
      .editAddress(id, data)
      .subscribe(
        (res) => {
          if (res) {
            this.reloadService.needRefreshData$();
            this.uiService.message(res.message,"success");
          }
        },
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
  }
  private removeOthorDefualtAddress(id: string | any) {
    for (let i = 0; i < this.addresses.length; i++) {
      if (id !== this.addresses[i]._id) {
        const data = {
          // setDefaultAddress: false,
        };
        this.subUpdateAddress = this.userDataService
          .editAddress(this.addresses[i]._id, data)
          .subscribe(
            (res) => {
              if (res) {
                this.reloadService.needRefreshData$();
              }
            },
            (err) => {
              if (err) {
                console.log(err);
              }
            }
          );
      }
    }
  }

  public onSelectEdittedAddress(address: UserAddress) {
    if (address) {
      this.selectEdittedAdress = address;
      this.isSelected = true;
      if (this.selectEdittedAdress !== null) {
        this.dataForm.patchValue(this.selectEdittedAdress);
        this.dataForm.patchValue({
          division: this.selectEdittedAdress?.division?._id,
        });
        this.dataForm.patchValue({ area: this.selectEdittedAdress?.area?._id });
        this.dataForm.patchValue({ zone: this.selectEdittedAdress?.zone?._id });
        this.getAllArea(this.dataForm.get('division')?.value);
        this.getAllZone(this.dataForm.get('area')?.value);
        this.storeAddress = this.selectEdittedAdress?.addressType;
        this.showAddressForm = true;
      }
    }
  }

  /***
   * ON SELECT CHANGE
   * onChangeRegion()
   * onChangeArea()
   */
  onChangeRegion(event: any) {
    if (event) {
      this.getAllArea(this.dataForm.get('division')?.value);
    }
  }

  onChangeArea(event: any) {
    if (event) {
      this.getAllZone(this.dataForm.get('area')?.value);
    }
  }

  /**
   * ADDRESS SELECT AND SHOW ADDRESS FORM FUNCTIONS
   * onAddressSelect();
   * onShowAddressForm();
   */
  onAddressSelect(address: string) {
    this.storeAddress = address;
    this.dataForm.patchValue({ addressType: address });
  }

  onShowAddressForm() {
    this.showAddressForm = true;
  }

  /**
   * SHOW AND HIDE POPUP FUNCTION
   * onHideShowPopup()
   */
  onHideShowPopup() {
    this.showAddressForm = false;
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}

