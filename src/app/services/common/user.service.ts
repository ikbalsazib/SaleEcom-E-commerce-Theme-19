import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DATABASE_KEY} from '../../core/utils/global-variable';
import {UserAuthResponse} from '../../interfaces/common/user.interface';
import {UtilsService} from '../core/utils.service';
import {StorageService} from '../core/storage.service';
import {UiService} from '../core/ui.service';
import {CartService} from './cart.service';

const API_URL = environment.apiBaseLink + '/api/user/';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Store Data
  private token: string;
  private _isUser = false;
  private userId: string = null;
  private userEmail: string = null;
  private userPhoneNo: string = null;
  userStatusListener = new Subject<boolean>();
  userLocalSavedData: any;

  // Hold The Count Time
  private tokenTimer: any;

  // Inject
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly uiService = inject(UiService);
  private readonly utilsService = inject(UtilsService);
  private readonly cartService = inject(CartService);


  /**
   * MAIN METHODS
   * checkUserWithPhoneNo()
   * userSignupAndLogin()
   * userLogin()
   * onSuccessAuthToken()
   * onFailedAuthToken()
   */

  checkUserWithPhoneNo(data: { phoneNo: string, countryCode: string }) {
    return this.httpClient.post<{
      data: any;
      message: string;
      success: boolean;
    }>(API_URL + 'check-user-with-phone-no', data);
  }

  userSignupAndLogin(data: any, navigateTo: string, navigateFrom?: string) {
    return new Promise((resolve, reject) => {
      this.httpClient
        .post<UserAuthResponse>(API_URL + 'signup-and-login', data)
        .subscribe({
          next: res => {
            if (res.success) {
              this.onSuccessAuthToken(res, navigateTo, navigateFrom);
              resolve(res);
            } else {
              this.onFailedAuthToken(res, true);
              reject(res);
            }
          },
          error: error => {
            console.log(error);
            this.onFailedAuthToken(null, true);
            reject(error);
          }
        })
    });
  }

  userLogin(
    data: { username: string; password: string },
    navigateTo: string,
    navigateFrom?: string
  ) {
    return new Promise((resolve, reject) => {
      this.httpClient
        .post<UserAuthResponse>(API_URL + 'login', data)
        .subscribe({
          next: res => {
            if (res.success) {
              this.onSuccessAuthToken(res, navigateTo, navigateFrom);
              resolve(res);
            } else {
              this.onFailedAuthToken(res, true);
              reject(res);
            }
          },
          error: error => {
            this.onFailedAuthToken(null, true);
            reject(error);
          }
        })

    });
  }

  private onSuccessAuthToken(res: UserAuthResponse, navigateTo: string, navigateFrom?: string) {
    this.token = res.token;
    // When Role & Permissions
    if (res.data) {
      this.userId = res.data._id;
      this.userEmail = res.data.email;
      this.userPhoneNo = res.data.phoneNo;
    }
    // When Token
    if (res.token) {
      this._isUser = true;
      this.userStatusListener.next(true);
      // For Token Expired Time..
      const expiredInDays = Number(res.tokenExpiredInDays.replace('d', ''));
      this.setSessionTimer(expiredInDays * 86400000);
      const now = new Date();
      const expirationDate = this.utilsService.getNextDateString(new Date(now.getTime() - 3600 * 1000), expiredInDays);
      // Store to Local
      this.saveUserData(res.token, expirationDate, this.userId, this.userEmail, this.userPhoneNo);

      // Sync Carts
      this.syncLocalCartItems().then(() => {},
        err => {
          console.log(err)
        }
      );


      // Snack bar
      this.uiService.message(res.message, 'success');
      // Navigate
      if (navigateTo) {
        if (navigateFrom) {
          this.router.navigate([navigateFrom]).then();
        } else {
          this.router.navigate([navigateTo]).then();
        }
      }
    }
  }

  private onFailedAuthToken(res?: UserAuthResponse, showSnackbar?: boolean) {
    if (showSnackbar) {
      this.uiService.message(res.message, 'wrong')
    }
    this.userStatusListener.next(false);
  }


  /**
   * Social Login
   * verifyGoogleLoginWithToken()
   */

  verifyGoogleLoginWithToken(
    data: { token: string; },
    navigateTo: string,
    navigateFrom?: string
  ) {
    return new Promise((resolve, reject) => {
      this.httpClient
        .post<UserAuthResponse>(API_URL + 'verify-google-login', data)
        .subscribe({
          next: res => {
            if (res.success) {
              this.onSuccessAuthToken(res, navigateTo, navigateFrom);
              resolve(res);
            } else {
              this.onFailedAuthToken(res, true);
              reject(res);
            }
          },
          error: error => {
            this.onFailedAuthToken(null, true);
            reject(error);
          }
        })

    });
  }


  /**
   * USER AFTER LOGGED IN METHODS
   * autoUserLoggedIn()
   * userLogOut()
   */
  autoUserLoggedIn() {
    const authInformation = this.getUserData();
    if (!authInformation) {
      this.storageService.removeDataFromEncryptLocal(
        DATABASE_KEY.encryptUserLogin
      );
      return;
    }
    const now = new Date();
    const expDate = new Date(authInformation.expiredDate);
    const expiresIn = expDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.userStatusListener.next(true);
      this._isUser = true;
      this.userId = authInformation.userId;
      this.userEmail = authInformation.userEmail;
      this.userPhoneNo = authInformation.userPhoneNo;
      this.setSessionTimer(expiresIn);
    }
  }

  userLogOut(needNavigate: boolean) {
    this.token = null;
    this._isUser = false;

    this.userStatusListener.next(false);
    // Clear Token from Storage
    this.clearUserData();
    // Clear The Token Time
    clearTimeout(this.tokenTimer);
    // Navigate
    if (needNavigate) {
      this.router.navigate([environment.userLoginUrl]).then();
    }
    // window.location.reload();
  }

  /**
   * GET LOGGED IN BASE DATA
   * isUser()
   * getUserToken()
   * getUserId()
   * getUserStatusListener()
   */

  get isUser(): boolean {
    return this._isUser;
  }

  getUserToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getUserStatus() {
    return this.isUser;
  }

  getUserEmail() {
    return this.userEmail;
  }

  getUserPhoneNo() {
    return this.userPhoneNo;
  }
  /**
   * Save & GET User Info Encrypt to Local
   * saveUserData()
   * clearUserData()
   * getUserData()
   * setSessionTimer()
   */
  protected saveUserData(token: string, expiredDate: Date, userId: string,userEmail: string, userPhoneNo: string) {
    const data = {
      token,
      expiredDate,
      userId,
      userEmail,
      userPhoneNo
    };
    this.storageService.addDataToEncryptLocal(
      data,
      DATABASE_KEY.encryptUserLogin
    );
  }

  protected clearUserData() {
    this.storageService.removeDataFromEncryptLocal(
      DATABASE_KEY.encryptUserLogin
    );
  }

  protected getUserData() {
    return this.storageService.getDataFromEncryptLocal(
      DATABASE_KEY.encryptUserLogin
    );
  }

  private setSessionTimer(durationInMs: number) {
    this.tokenTimer = setTimeout(() => {
      this.userLogOut(true);
    }, durationInMs); // 1s = 1000ms
  }


  /**
   * CART UPDATE LOCAL TO MAIN DATABASE
   * syncLocalCartItems()
   */

  private async syncLocalCartItems(): Promise<any> {
    const items = this.cartService.getCartItemFromLocalStorage();

    if (items && items.length) {
      return new Promise((resolve, reject) => {
        this.cartService.addToCartMultiple(items)
          .subscribe({
            next: res => {
              this.cartService.deleteAllCartFromLocal(true);
              resolve(res);
            },
            error: err => {
              console.log(err)
              reject(err);
            }
          });
      });
    }
  }

  /**
   * Get User Data
   */


  getUserDataFromLocal() {
    this.userLocalSavedData = this.storageService.getDataFromEncryptLocal(DATABASE_KEY.userInfoForPixel);
  }

  getUserLocalDataByField(field: string) {
    if (this.userLocalSavedData) {
      if (this.userLocalSavedData[field]) {
        return this.userLocalSavedData[field];
      }
    } else {
      return null;
    }
  }


}
