export interface ProductStoreInfo {
  id: string;
  storeName: string;
  city?: string;
  district?: string;
  state?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  primaryImageUrl?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  uploadedAt?: string;
}

export interface ProductRecord {
  id: string;
  storeId: string;
  storeName?: string;
  storeCity?: string;
  storeDistrict?: string;
  storeState?: string;
  store?: ProductStoreInfo;
  name: string;
  description: string;
  category: string;
  brand?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  unit: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  images?: ProductImage[];
  primaryImageUrl?: string;
  imageUrls?: string[];
  location?: [number, number];
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
}
