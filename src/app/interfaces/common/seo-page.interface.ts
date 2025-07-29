export interface SeoPage {
  _id?: string;
  name?: string;
  seoTitle?: string;
  seoDescription?: string;
  images?: string[];
  type?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
