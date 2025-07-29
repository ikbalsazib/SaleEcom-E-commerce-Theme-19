import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {User, UserAddress} from '../../interfaces/common/user.interface';
import {Subject} from "rxjs";

const API_URL = environment.apiBaseLink + '/api/user/';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  // Store Data
  userDataPass = new Subject<any>();

  // Inject
  private readonly httpClient = inject(HttpClient);


  /**
   * getLoggedInUserData()
   * updateLoggedInUserInfo()
   * checkUserWithPhoneNoForResetPassword()
   * resetUserPassword()
   * getUserAddress()
   * passUserData()
   * changeLoggedInUserPassword()
   * addAddress()
   * editAddress()
   * deleteAddressById()
   */

  getLoggedInUserData(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: User }>(API_URL + 'logged-in-user-data', {params});
  }

  updateLoggedInUserInfo(data: any) {
    return this.httpClient.put<ResponsePayload>(API_URL + 'update-logged-in-user', data);
  }

  checkUserWithPhoneNoOrEmailForResetPassword(data: any) {
    return this.httpClient.post<ResponsePayload>(API_URL + 'check-user-with-phone-no-or-email-for-reset-password', data);
  }

  resetUserPassword(data: { phoneNo: string, countryCode: string }) {
    return this.httpClient.put<{ message: string; success: boolean }>(API_URL + 'reset-user-password', data);
  }

  getUserAddress() {
    return this.httpClient.get<{
      data: UserAddress[],
      deliveryCharges: any[],
      success: boolean,
      message?: string
    }>(API_URL + 'get-user-address');
  }

  passUserData(data: User) {
    this.userDataPass.next(data);
  }

  changeLoggedInUserPassword(data: { password: string, oldPassword: string }) {
    return this.httpClient.put<ResponsePayload>(API_URL + 'change-logged-in-user-password', data);
  }

  addAddress(address: any) {
    return this.httpClient.post<{
      success: boolean,
      message: string,
      data: { _id: string }
    }>(API_URL + 'add-address', address);
  }

  editAddress(id: string, data: UserAddress) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_URL + 'edit-address/' + id, data);
  }

  deleteAddressById(addressId: string) {
    return this.httpClient.delete<{ message: string }>(API_URL + 'delete-address/' + addressId);
  }

}
