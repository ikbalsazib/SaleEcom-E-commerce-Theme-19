import {Injectable} from '@angular/core';
import moment from 'moment';
import sha256 from 'crypto-js/sha256';
import {PixelUserData} from '../../interfaces/core/analytics.interface';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  getNextDateString(date: Date, day) {
    return moment(date).add(day, 'days').toDate();
  }

  getDateString(date: Date, format?: string): string {
    const fm = format ? format : 'YYYY-MM-DD';
    return moment(date).format(fm);
  }

  removeUrlQuery(url: string): string {
    if (url) {
      return url.replace(/\?.*/, '');
    }
    return '';
  }

  stringToSlug(value: string): string {
    let text = value?.toLowerCase();
    if (text?.charAt(0) == " ") {
      text = text.trim();
    }
    if (text?.charAt(text.length - 1) == "-") {
      text = (text?.replace(/-/g, ""));
    }
    text = text?.replace(/ +/g, "");
    text = text?.replace(/--/g, "");
    text = text?.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); // Note: Normalize('NFKD') used to normalize special alphabets like óã to oa
    text = text?.replace(/[^a-zA-Z0-9 -]/g, "");

    return text;
  }

  numbersToRangeStrings(numbers: number[]) {
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    if (min !== max) {
      return `${min}-${max}`;
    } else {
      return `${min}`;
    }


  }

  routeBaseVisibility(currentUrl: string) {
    switch (currentUrl) {
      case '/':
        return true;
      default:
        return false;
    }
  }

  getImageName(originalName: string): string {
    const array = originalName.split('.');
    array.pop();
    return array.join('');
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  roundNumber(num: number): number {
    const integer = Math.floor(num);
    const fractional = num - integer;

    //Converting the fractional to the integer
    const frac2int = (fractional * 100) / 5;
    const fracCeil = Math.ceil(frac2int);

    //transforming inter into fractional
    const FracOut = (fracCeil * 5) / 100;
    const ans = integer + FracOut;

    return Number((Math.round(ans * 100) / 100).toFixed(2));
  }

  /**
   * Hash Data
   * SHA256 hashing Format
   * hashDataSha256()
   * formatPhoneNumber()
   */
  // hashDataSha256(value: string): string {
  //   return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
  // }

  formatPhoneNumber(phone: string): string {
    // Ensure phone is in E.164 format (e.g., +1234567890)
    return phone?.replace(/\D/g, ''); // Remove non-numeric characters
  }
  generateEventId(): string {
    return Math.random().toString(36).substring(2, 15); // Generate unique event ID
  }

  // Hashing method
  hashDataSha256(value: string): string {
    return sha256(value).toString();
  }

  // 🔹 Final user_data generator method
  getUserData(pixelUserData: PixelUserData): { em?: string; ph?: string } {
    const {email, phoneNo, firstName, lastName, gender, dob, city, zip, external_id} = pixelUserData;
    const userData: any = {};

    if (phoneNo) {
      const formattedPhone = this.formatPhoneNumber('88' + phoneNo);
      userData.ph = this.hashDataSha256(formattedPhone);
    } else {
      userData.ph = this.hashDataSha256('8801700000000');
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      userData.em = this.hashDataSha256(normalizedEmail);
    } else {
      userData.em = this.hashDataSha256('noemail@gmail.com');
    }

    if (city) {
      const normalizedCity = city.trim().toLowerCase();
      userData.ct = [this.hashDataSha256(normalizedCity)];
    } else {
      userData.ct = [this.hashDataSha256('global')];
    }

    userData.country = [this.hashDataSha256('bd')];
    userData.fn = [this.hashDataSha256(firstName ?? 'Mr')];
    userData.ln = [this.hashDataSha256(lastName ?? 'Unknown')];
    // userData.ge = this.hashDataSha256(gender ?? 'm');
    userData.st = [this.hashDataSha256('bd')];
    // userData.zp = this.hashDataSha256(zip ?? '1200');
    // userData.db = this.hashDataSha256(dob ?? '19970216');
    userData.external_id = [this.hashDataSha256(external_id ?? `${Date.now()}`)];

    return {...userData, ...this.getFbCookies()};
  }


  getFbCookies(): { fbp?: string; fbc?: string } | {} {
    const cookies = Object.fromEntries(
      document.cookie.split(';').map(cookie => {
        const [key, ...valParts] = cookie.trim().split('=');
        return [key, valParts.join('=')];
      })
    );

    const result: { fbp?: string; fbc?: string } = {};
    if (cookies['_fbp']) result.fbp = cookies['_fbp'];
    if (cookies['_fbc']) result.fbc = cookies['_fbc'];

    return result;
  }

}
