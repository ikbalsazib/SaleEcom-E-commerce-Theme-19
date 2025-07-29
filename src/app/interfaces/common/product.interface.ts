import {Category} from "./category.interface";
import {Tag} from "./tag.interface";
import {ChildCategory} from "./child-category.interface";
import {SubCategory} from "./sub-category.interface";
import {Variation, VariationOption} from "./variation.interface";

export interface Product {
  _id?: string;
  name: string;
  slug?: string;
  seoKeyword?: string;
  description?: string;
  category?: Category;
  subCategory?: SubCategory;
  childCategory?: ChildCategory;
  brand?: CatalogInfo;
  tags?: string[] | Tag[];
  specifications?: ProductSpecification[];
  costPrice?: number;
  salePrice: number;
  regularPrice: number;
  keyWord: any;
  images?: string[];
  image?: string;
  shortDescription?: string;
  quantity?: number;
  hasVariations?: boolean;
  variations?: Variation[];
  variationsOptions?: VariationOption[];
  status?: string;
  warranty?: string;
  totalSold?: string;
  totalView?: string;
  weight?: number;
  model?: string;
  videoUrl?: string;
  discountType?: string;
  discountAmount?: number;
  unit?: string;
  minimumWholesaleQuantity?: any;
  maximumWholesaleQuantity?: any;
  wholesalePrice?: any;
  variation2: any;
  variation: any;
  // Rating
  ratingDetails: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
  ratingAvr: number;
  reviewTotal?: number;
  ratingTotal?: number;
  ratingCount?: number;
  ratingDone?: number[] | any;
  ratingDue?: number[] | any ;

  // Seo
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  // Point
  earnPoint?: boolean;
  pointType?: number;
  pointValue?: number;
  redeemPoint?: boolean;
  redeemType?: number;
  redeemValue?: number;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
  isVariation?: boolean;
  selectedQty?: number;
  // For Create Order
  orderVariationOption?: VariationOption;
  orderVariation?: string;
  variationOptions?: any;
  variation2Options?: any;
  variationList?: VariationList[];

  // For Offer
  offerDiscountAmount?: number;
  offerDiscountType?: number;
  resetDiscount?: boolean;

  vendor?: any;
}

interface CatalogInfo {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductSpecification {
  name?: string;
  value?: string;
}

export interface VariationList {
  _id?: string;
  name?: string;
  sku?: string;
  image?: string;
  salePrice?: number;
  regularPrice?: number;
  costPrice?: number;
  discountType?: string;
  discountAmount?: number;
  quantity?: number;
}


export interface PriceData {
  _id: string;
  costPrice: number;
  salePrice: number;
  discountType?: number;
  discountAmount?: number;
  quantity: number;
  soldQuantity?: number;
  unit: string;
  name: string;
  unitValue:any
}

export interface ProductFilterGroup {
  categories: GroupCategory[];
  subCategories: GroupSubCategory[];
  brands: BrandSubCategory[];
}

interface GroupCategory {
  _id: {
    category: string
  },
  name: string;
  slug: string;
  images: string;
  total: number;
  select?: boolean;
}


interface GroupSubCategory {
  _id: {
    subCategory: string
  },
  name: string;
  slug: string;
  images: string;
  total: number;
  select?: boolean;
}

interface BrandSubCategory {
  _id: {
    brand: string
  },
  name: string;
  slug: string;
  images: string;
  total: number;
  select?: boolean;
}

