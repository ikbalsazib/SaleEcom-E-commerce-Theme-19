import {Zone} from "./zone.interface";
import {Area} from "./area.interface";
import {Division} from "./division.interface";
import {Coupon} from "./coupon.interface";

export interface User {
  _id?: string;
  name?: string;
  fullName?: string
  profileBanner?: string
  parentPhone?: string
  maritalStatus?: string
  userId?: string
  educationLevel?: string
  partnerProfession?: string
  additionalInformation?: string
  islamicPractice?: string
  secondEthnicity?: string
  selfSummery?: string
  pauseStatus?: string
  countryCode?: string
  pauseNote?: string
  profession?: string
  cityzenShip?: string
  ethnicity?: string
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  credit?: number;
  requests?: any;
  username?: string;
  countryOfResidence?: string;
  cityOfResidence?: string;
  phoneNo?: string;
  email?: string;
  height?: string;
  dateOfBirth?: string;
  age?: string;
  password?: string;
  gender?: string;
  profileImg?: any;
  registrationType?: string;

  hides?: string | User[] | any;

  hasAccess?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  success?: boolean;
  userFrom?: string;
  aboutMe?: string;
  registrationAt?: string;

  rewardPoints?: number;

  division?: Division;
  area?: Area;
  zone?: Zone;

  usedCoupons?: string[] | Coupon[];
}

export interface UserAuthResponse {
  success: boolean;
  token?: string;
  tokenExpiredInDays?: string;
  data?: any;
  message?: string;
}

export interface UserAddress {
  _id?: string;
  addressType?: string;
  name?: string;
  phoneNo?: string;
  shippingAddress?: string;
  division?: any;
  area?: any;
  zone?: any;
  isDefaultAddress?: boolean;
}

