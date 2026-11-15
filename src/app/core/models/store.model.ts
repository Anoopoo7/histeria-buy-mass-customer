export interface StorePhoto {
  id?: string;
  url: string;
  category?: string;
}

export interface StoreLocationObject {
  latitude: number;
  longitude: number;
}

export interface StoreRecord {
  id: string;
  storeName: string;
  storeCode?: string;
  businessType: string;
  description?: string;
  addressLine1?: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  location?: StoreLocationObject | [number, number];
  primaryImageUrl?: string;
  photos?: StorePhoto[];
  imageUrls?: string[];
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  activeCampaignCount?: number;
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
}
