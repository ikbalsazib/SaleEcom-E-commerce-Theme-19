import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

const API_URL = `${environment.apiBaseLink}/api/otp/`;

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * validateOtpWithPhoneNo()
   */

  validateOtpWithPhoneNo(data: { phoneNo: string, code: string, countryCode?: string }) {
    return this.httpClient.post<{ data: any, success: boolean, message: string }>(API_URL + 'validate-otp', data);
  }
  generateOtpWithPhoneNo(data: { phoneNo: string}) {
    return this.httpClient.post<{
      data: any;
      message: string;
      success: boolean;
    }>(API_URL + 'generate-otp', data);
  }
}
