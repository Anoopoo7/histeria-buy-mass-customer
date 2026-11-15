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
  latitude?: number;
  longitude?: number;
  location?: [number, number];
  primaryImageUrl?: string;
  imageUrls?: string[];
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  activeCampaignCount?: number;
  distanceKm?: number;
}
