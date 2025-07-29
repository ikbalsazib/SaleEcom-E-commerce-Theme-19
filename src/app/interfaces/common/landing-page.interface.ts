export interface LandingPage {
  _id?: string;
  readOnly?: boolean;
  name?: string;
  slug?: string;
  images?: [string];
  priority?: number;
  product?: any;
  description?: string;
  template?: any;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
