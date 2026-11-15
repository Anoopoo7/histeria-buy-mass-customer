export type PoolStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PoolTier {
  targetAmount: number;
  discountPercentage: number;
}

export interface PoolProductItem {
  productId: string;
  name?: string;
  price?: number;
  targetAmount?: number;
  discountPercentage?: number;
}

export interface PoolRecord {
  id: string;
  poolCode?: string;
  storeId: string;
  storeName?: string;
  storeCity?: string;
  storeState?: string;
  title: string;
  description?: string;
  productIds: string[];
  productNames?: string[];
  categories?: string[];
  products?: PoolProductItem[];
  primaryImageUrl?: string;
  startsAt: string;
  endsAt: string;
  durationMinutes?: number;
  status: PoolStatus;
  minParticipants?: number;
  tiers: PoolTier[];
  targetAmount?: number;
  discountPercentage?: number;
  maxDiscountPercentage?: number;
  currentParticipantCount?: number;
  currentTotalAmount?: number;
  distanceKm?: number;
}

export interface PoolParticipationRecord {
  id: string;
  poolId: string;
  cartId: string;
  userId: string;
  storeId: string;
  itemsSnapshot: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  eligibleCartValue: number;
  status: 'SUBMITTED' | 'ORDER_COMPLETED' | 'WITHDRAWN';
  submittedAt: string;
  withdrawnAt?: string | null;
}
