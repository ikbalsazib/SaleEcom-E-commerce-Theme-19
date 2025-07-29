export interface Carousel {
  _id?: string;
  name?: string;
  images?: string[];
  url?: string;
  urlType?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
