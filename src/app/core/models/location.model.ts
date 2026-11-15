export interface CustomerLocation {
  latitude: number | null;
  longitude: number | null;
  addressLabel: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  radiusKm: number;
  selectedAt: number;
  source: 'gps' | 'map' | 'manual' | 'preset' | 'default';
}

export interface SavedAddress {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  title: string;
  locality: string;
  city: string;
  district?: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export const ALLOWED_RADIUS_KM = [1, 3, 5, 10, 20, 30, 50] as const;
export type DiscoveryRadius = typeof ALLOWED_RADIUS_KM[number];

export const KERALA_CITY_PRESETS: Array<{ name: string; district: string; lat: number; lng: number }> = [
  { name: 'Kochi (Ernakulam)', district: 'Ernakulam', lat: 9.9312, lng: 76.2673 },
  { name: 'Kozhikode', district: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  { name: 'Thiruvananthapuram', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { name: 'Thrissur', district: 'Thrissur', lat: 10.5276, lng: 76.2144 },
  { name: 'Kollam', district: 'Kollam', lat: 8.8932, lng: 76.6141 },
  { name: 'Kannur', district: 'Kannur', lat: 11.8745, lng: 75.3704 },
  { name: 'Alappuzha', district: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
  { name: 'Palakkad', district: 'Palakkad', lat: 10.7867, lng: 76.6548 },
  { name: 'Varkala', district: 'Thiruvananthapuram', lat: 8.7379, lng: 76.7163 },
  { name: 'Malappuram', district: 'Malappuram', lat: 11.0732, lng: 76.0740 },
  { name: 'Kottayam', district: 'Kottayam', lat: 9.5916, lng: 76.5222 },
  { name: 'Wayanad (Kalpetta)', district: 'Wayanad', lat: 11.6050, lng: 76.0830 },
];
