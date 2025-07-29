import {Component} from '@angular/core';
import {AccountSidebarComponent} from "../../../shared/components/account-sidebar/account-sidebar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PasswordManageComponent} from "./password-manage/password-manage.component";
import {AccountStatusComponent} from "./account-status/account-status.component";
import {MatDialogModule} from "@angular/material/dialog";

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss',
  standalone: true,
  imports: [
    AccountSidebarComponent,
    ReactiveFormsModule,
    FormsModule,
    PasswordManageComponent,
    AccountStatusComponent,
    MatDialogModule,
  ]
})
export class SettingComponent { }
