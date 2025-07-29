import { Component } from '@angular/core';
import {AccountAddressComponent} from "./account-address/account-address.component";
import {AccountSidebarComponent} from "../../../shared/components/account-sidebar/account-sidebar.component";

@Component({
  selector: 'app-my-address',
  templateUrl: './my-address.component.html',
  styleUrl: './my-address.component.scss',
  standalone: true,
  imports: [
    AccountAddressComponent,
    AccountSidebarComponent
  ]
})
export class MyAddressComponent {

}
