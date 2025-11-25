export type DealCategory = "all" | "restaurant" | "grocery" | "gas" | "coffee";

export type SortOption = "closest" | "highest-discount" | "trending";

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Deal {
  id: string;
  storeName: string;
  storeLogo?: string;
  category: DealCategory;
  title: string;
  description: string;
  image: string;
  discount: number; // Percentage
  originalPrice?: number;
  discountedPrice?: number;
  location: Location;
  distance?: number; // in km
  badge?: "great-deal" | "ends-soon" | "trending" | "new";
  expiresAt: Date;
  views: number;
  clicks: number;
  partnerAppUrl?: string;
  partnerAppName?: string;
  deals: DealItem[]; // Multiple deals per store
}

export interface DealItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  discount: number;
  originalPrice?: number;
  discountedPrice?: number;
  badge?: "great-deal" | "ends-soon" | "trending" | "new";
  expiresAt: Date;
  partnerAppUrl?: string;
  partnerAppName?: string;
}

