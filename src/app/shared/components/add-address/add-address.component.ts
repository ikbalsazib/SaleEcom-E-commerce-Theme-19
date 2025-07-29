import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Division} from "../../../interfaces/common/division.interface";
import {Area} from "../../../interfaces/common/area.interface";
import {Subscription} from "rxjs";
import {UiService} from "../../../services/core/ui.service";
import {AreaService} from "../../../services/common/area.service";
import {DivisionService} from "../../../services/common/division.service";
import {ZoneService} from "../../../services/common/zone.service";
import {UserDataService} from "../../../services/common/user-data.service";
import {FilterData} from "../../../interfaces/core/filter-data";
import {Zone} from '../../../interfaces/common/zone.interface';
import {MatFormField} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOption, MatSelect, MatSelectChange} from "@angular/material/select";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {User} from "../../../interfaces/common/user.interface";
import {OnlyNumberDirective} from '../../directives/number-only.directive';
import {UserService} from "../../../services/common/user.service";

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrl: './add-address.component.scss',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInputModule,
    OnlyNumberDirective,
    MatSelect,
    MatOption
  ],
  standalone: true,
})
export class AddAddressComponent implements OnInit, OnDestroy {
  // Store Data
  dataForm!: FormGroup;
  divisions?: Division[] = [];
  area?: Area[] = [];
  zone?: Zone[] = [];
  isLoading = false;
  user: User;

  // Inject
  protected readonly dialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AddAddressComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly userDataService = inject(UserDataService);
  private readonly divisionService = inject(DivisionService);
  private readonly areaService = inject(AreaService);
  private readonly zoneService = inject(ZoneService);
  protected readonly userService = inject(UserService);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit(): void {
    // Base Data
    this.initForm();
    this.getAllDivision();
    if (this.userService.isUser) {
      this.getLoggedInUserInfo();
    }

    // On Edit Dialog
    if (this.dialogData) {
      this.setDataForm();
    }

  }

  /**
   * Form Methods
   * initForm()
   * setDataForm()
   * onSubmit()
   */
  initForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      phoneNo: [null, [Validators.required, Validators.maxLength(11)]],
      division: [null, Validators.required],
      area: [null, Validators.required],
      zone: [null],
      shippingAddress: [null, [Validators.required]],
      addressType: ['home'],
      isDefaultAddress: [true],
    });
  }

  private setDataForm() {
    this.dataForm.patchValue(this.dialogData);
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.message('Please complete all the required field', 'warn');
      return;
    }
    if (this.dialogData) {
      this.editAddress(this.dialogData._id, this.dataForm.value);
    } else {
      this.addAddress(this.dataForm.value);
    }

  }

  /**
   * HTTP Req Handle
   * getLoggedInUserInfo()
   * getAllDivision()
   * getAreaByParentId()
   * getZoneByParentId()
   * addAddress()
   * editAddress()
   */

  private getLoggedInUserInfo() {
    const subscription = this.userDataService.getLoggedInUserData('name phoneNo')
      .subscribe({
        next: res => {
          this.user = res.data;
          // When Not In Edit Mood Patch Value
          if (!this.dialogData) {
            this.dataForm.patchValue({name: this.user?.name, phoneNo: this.user?.phoneNo});
          }
        },
        error: err => {
          console.log(err);
        }
      });
    this.subscriptions?.push(subscription);
  }


  private getAllDivision() {
    let mSelect = {
      name: 1,
    };
    const filter: FilterData = {
      filter: {status: 'publish'},
      select: mSelect,
      pagination: null,
      sort: {name: 1},
    };

    const subscription = this.divisionService.getAllDivisions(filter).subscribe({
      next: res => {
        this.divisions = res.data;

        // When In Edit Mood Patch Value
        if (this.dialogData?.division) {
          const fData = this.divisions.find(f => f.name === this.dialogData.division);
          if (fData) {
            this.getAreaByParentId(fData._id);
          }
        }
      },
      error: err => {
        console.log(err);
      }
    });
    this.subscriptions?.push(subscription);
  }

  private getAreaByParentId(id: string) {
    const select = 'name';
    const subscription = this.areaService.getAreaByParentId(id, select)
      .subscribe({
        next: res => {
          this.area = res.data;

          // When In Edit Mood Patch Value
          if (this.dialogData?.area) {
            const fData = this.area.find(f => f.name === this.dialogData.area);
            if (fData) {
              this.getZoneByParentId(fData._id);
            }

          }
        },
        error: err => {
          console.log(err);
        }
      });
    this.subscriptions?.push(subscription);
  }

  private getZoneByParentId(id: string) {
    const select = 'name';
    const subscription = this.zoneService.getZoneByParentId(id, select)
      .subscribe({
        next: res => {
          this.zone = res.data;
        },
        error: err => {
          console.log(err);
        }
      });
    this.subscriptions?.push(subscription);
  }

  private addAddress(data: any) {
    this.isLoading = true;
    const subscription = this.userDataService.addAddress(data)
      .subscribe({
        next: res => {
          this.isLoading = false;
          if (res.success) {
            this.uiService.message(res.message, 'success');
            this.dialogRef.close({data: {...data, ...{_id: res.data?._id}}})
          } else {
            this.uiService.message(res.message, 'wrong');
          }
        },
        error: err => {
          this.isLoading = false;
          this.uiService.message('Sorry! Something went wrong, try again.', "wrong");
          console.log(err)
        }
      });
    this.subscriptions?.push(subscription);
  }

  private editAddress(id: string, data: any) {
    const subscription = this.userDataService.editAddress(id, {...data, ...{isDefaultAddress: true}})
      .subscribe({
        next: res => {
          if (res.success) {
            this.uiService.message(res.message, 'success');
            this.dialogRef.close({data: {...data, ...{_id: id, isDefaultAddress: true}}})

          }
        },
        error: err => {
          this.uiService.message('Sorry! something went wrong.', "wrong");
          console.log(err);
        }
      });
    this.subscriptions?.push(subscription);
  }


  /***
   * On Selection Change
   * onChangeDivision()
   * onChangeArea()
   */
  onChangeDivision(event: MatSelectChange) {
    if (event) {
      const fData = this.divisions.find(f => f.name === event.value)
      this.getAreaByParentId(fData._id);
    }
  }

  onChangeArea(event: MatSelectChange) {
    if (event) {
      const fData = this.area.find(f => f.name === event.value)
      this.getZoneByParentId(fData._id);
    }
  }

  onAddressTypeChange(address: string) {
    this.dataForm.patchValue({addressType: address});
  }


  /**
   * Dialog Methods
   * onClose()
   */
  onClose() {
    this.dialogRef.close({data: null})
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
