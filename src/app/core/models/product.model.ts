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
  storeState?: string;
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
}
