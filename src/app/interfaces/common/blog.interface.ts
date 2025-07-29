export interface Blog {
  _id?: string;
  name?: string;
  slug?: string;
  title?: string;
  image?: string;
  images?: any;
  authorName?: string;
  mobileImage?: string;
  description?: string;
  shortDesc?:string;
  priority?:number;
  totalView?:number;
  createdAt?: Date;
  updatedAt?: Date;
}
