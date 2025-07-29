export interface Brand {
  _id?: string;
  readOnly?: boolean;
  name?: string;
  slug?: string;
  images?: [string];
  priority?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
