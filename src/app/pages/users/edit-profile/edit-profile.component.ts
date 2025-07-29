import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserDataService} from "../../../services/common/user-data.service";
import {ReloadService} from "../../../services/core/reload.service";
import {map, Observable, shareReplay, Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {User} from "../../../interfaces/common/user.interface";
import {FileData} from "../../../interfaces/core/file-data";
import {UiService} from "../../../services/core/ui.service";
import {FileUploadService} from "../../../services/gallery/file-upload.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {ImageCropComponent} from "../image-crop/image-crop.component";
import {UserService} from "../../../services/common/user.service";
import {AccountSidebarComponent} from "../../../shared/components/account-sidebar/account-sidebar.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatBadgeModule} from "@angular/material/badge";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ImageCropperComponent} from "ngx-image-cropper";

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
  standalone: true,
  imports: [
    AccountSidebarComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatProgressSpinner,
    ImageCropperComponent,
    ImageCropComponent
  ]
})
export class EditProfileComponent implements OnInit, OnDestroy {

  // DATA FORM
  dataForm!: FormGroup;
  isLoading = false;
  user?: User | any;

  // Image Upload
  imageChangedEvent: any = null;
  imgPlaceHolder:any;
  pickedImage?: any;
  file: any = null;
  newFileName?: any;
  imgBlob: any = null;

  // BREAKPOINTS
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(['(max-width: 599px)'])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  // Inject
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly userDataService = inject(UserDataService);
  private readonly reloadService = inject(ReloadService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly uiService = inject(UiService);
  private readonly dialog = inject(MatDialog);

  constructor(
    private breakpointObserver: BreakpointObserver
  ) {}

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subscription = this.reloadService.refreshData$.subscribe(() => {
      this.getLoggedInUserInfo();
    });
    this.subscriptions?.push(subscription);

    // FORM INITIALIZE
    this.initialForm();

    // Base Data
    if (this.userService.isUser) {
      this.getLoggedInUserInfo();
    }
  }

  /**
   * FORM SUBMIT FUNCTION
   * initialForm()
   * onSubmit();
   */
  initialForm() {
    this.dataForm = this.fb.group({
      name: [null],
      phoneNo: [null],
      gender: [null],
      dateOfBirth: [null],
      email: [null, Validators.required],
    });
  }

  onSubmit() {
    if (this.dataForm?.invalid) {
      this.uiService.message('Invalid Form','warn');
    } else {
      this.updateLoggedInUserInfo(this.dataForm.value);
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * getLoggedInUserInfo()
   * updateLoggedInUserInfo()
   * imageUploadOnServer()
   * removeOldImageFromServer()
   */

   private getLoggedInUserInfo() {
    const subscription = this.userDataService.getLoggedInUserData().subscribe({
      next: (res: any) => {
        if (res) {
          this.user = res.data;
          this.dataForm.patchValue(this.user);
          this.userDataService.passUserData(this.user);
          if (this.user?.profileImg) {
            this.imgPlaceHolder = this.user.profileImg;
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.subscriptions?.push(subscription);
  }

   updateLoggedInUserInfo(data: any) {
    this.isLoading = true;
    const subscription = this.userDataService.updateLoggedInUserInfo(data).subscribe({
        next: (res: any) => {
          if (res) {
            this.uiService.message(res.message,'success');
            this.reloadService.needRefreshData$();
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

   private imageUploadOnServer() {
    const data: FileData= {
      fileName: this.newFileName,
      file: this.imgBlob,
      folderPath: 'admins',
    };
    const subscription = this.fileUploadService.uploadSingleImage(data).subscribe({
        next: (res) => {
          if (res) {

            this.removeImageFiles();
            if (this.user?.profileImg) {
              this.removeOldImageFromServer(this.user?.profileImg);
            }

            this.updateLoggedInUserInfo({ profileImg: res?.url });
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

   private removeOldImageFromServer(imgUrl: string) {
  const subscription = this.fileUploadService.removeSingleFile(imgUrl).subscribe({
        next: (res) => {
          // console.log(res.message);
        },
        error: (err) => {
          console.log(err);
        },
      });
  this.subscriptions?.push(subscription);
}

  /**
   * ON IMAGE PICK
   * fileChangeEvent()
   * removeImageFiles()
   */

   fileChangeEvent(event: any) {
    this.file = (event?.target).files[0];
    // File Name Modify...
    const originalNameWithoutExt = this.file.name
      .toLowerCase()
      .split(' ')
      .join('-')
      .split('.')
      .shift();
    const fileExtension = this.file.name.split('.').pop();
    // Generate new File Name
    this.newFileName = `${Date.now().toString()}_${originalNameWithoutExt}.${fileExtension}`;

    const reader = new FileReader();
    reader.readAsDataURL(this.file);

    reader.onload = () => {
      this.imgPlaceHolder = reader.result as string;
    };

    // Open Upload Dialog
    if (event.target.files[0]) {
      this.openComponentDialog(event);
    }

    // NGX Image Cropper Event..
    this.imageChangedEvent = event;
  }

   private removeImageFiles() {
    this.file = null;
    this.newFileName = null;
    this.pickedImage = null;
    this.imgBlob = null;
  }

  /**
   * OPEN COMPONENT DIALOG
   * openComponentDialog()
   */
   public openComponentDialog(data?: any) {
    const dialogRef = this.dialog.open(ImageCropComponent, {
      data,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      disableClose: true,
      width: '680px',
      minHeight: '400px',
      maxHeight: '600px',
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {

        if (dialogResult.imgBlob) {
          this.imgBlob = dialogResult.imgBlob;

        }
        if (dialogResult.croppedImage) {
          this.pickedImage = dialogResult.croppedImage;
          this.imgPlaceHolder = this.pickedImage;

          if (this.pickedImage) {

            this.imageUploadOnServer();
          }
        }
      }
    });
  }

  /***
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
