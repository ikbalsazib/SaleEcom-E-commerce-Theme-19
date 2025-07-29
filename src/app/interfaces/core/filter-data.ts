import {Pagination} from "./pagination";

export interface FilterData {
  filter?: any,
  filterGroup?: FilterGroup;
  pagination?: Pagination | any,
  paginationProduct?: Pagination | any,
  select?: any;
  sort?: any;
}


export interface FilterGroup {
  isGroup?: boolean;
  category?: boolean;
  subCategory?: boolean;
  brand?: boolean;
}
