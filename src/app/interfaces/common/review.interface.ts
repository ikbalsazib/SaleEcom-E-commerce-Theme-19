import {User} from './user.interface';
import {Product} from "./product.interface";

export interface Review {
  _id?: string;
  user?: string | User;
  product?: Product;
  name?: string;
  order_Id?: string;
  orderId?: string;
  userName?: string;
  reviewDate: string;
  review: string;
  rating: any;
  ratingDue: any[];
  ratingDone: any[];
  status: boolean;
  reply: string;
  replyDate: string;
  like: number;
  dislike: number;
  images: string[];
}
