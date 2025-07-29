import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {environment} from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import {SecretKeyTypeEnum} from '../../enum/secret-key-type.enum';
import {isPlatformBrowser} from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // Inject
  private readonly platformId = inject(PLATFORM_ID)


  /**
   * ENCRYPT LOCAL STORAGE
   * storeDataToSessionStorage()
   * getDataFromSessionStorage()
   * addDataToEncryptLocal()
   * getDataFromEncryptLocal()
   * removeDataFromEncryptLocal()
   */

  storeDataToSessionStorage(key: string, data: any) {
    if(isPlatformBrowser(this.platformId)){
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  }

  getDataFromSessionStorage(key: string): any {
    if(isPlatformBrowser(this.platformId)){
    const data = sessionStorage.getItem(key);
    return JSON.parse(data);
    }
  }

  addDataToEncryptLocal(data: object, key: string) {
    if (isPlatformBrowser(this.platformId)) {
      const encryptedData = this.encryptWithCrypto(data, SecretKeyTypeEnum.STORAGE_TOKEN);
      localStorage.setItem(key, encryptedData);
    }

  }

  getDataFromEncryptLocal(key: string) {
    if (isPlatformBrowser(this.platformId)) {
      const encryptString = localStorage.getItem(key);
      if (encryptString) {
        return this.decryptWithCrypto(encryptString, SecretKeyTypeEnum.STORAGE_TOKEN);
      } else {
        return null;
      }
    }
  }

  removeDataFromEncryptLocal(key: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }


  /**
   * ENCRYPT CRYPTO JS
   * encryptWithCrypto()
   * decryptWithCrypto()
   */
  encryptWithCrypto(data: object, secretKey: string) {
    const cryptToSecretKey = this.getSecretKey(secretKey);
    return CryptoJS.AES.encrypt(JSON.stringify(data), cryptToSecretKey).toString();
  }

  decryptWithCrypto(encryptString: string, secretKey: string) {
    const cryptToSecretKey = this.getSecretKey(secretKey);
    const bytes = CryptoJS.AES.decrypt(encryptString, cryptToSecretKey);
    try {
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      return null;
    }
  }

  // Get Secret Key
  protected getSecretKey(secretKey: string): string {
    switch (secretKey) {
      case SecretKeyTypeEnum.STORAGE_TOKEN: {
        return environment.storageSecret;
      }
      default: {
        return environment.storageSecret;
      }
    }
  }


}
