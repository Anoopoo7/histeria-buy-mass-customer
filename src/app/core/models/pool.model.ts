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

export interface PoolTierProgress {
  tierIndex: number;
  targetAmount: number;
  discountPercentage: number;
  isReached: boolean;
  isCurrent: boolean;
  remainingAmount: number;
  progressPercentage: number;
}

export interface PoolNextTier {
  tierIndex: number;
  targetAmount: number;
  discountPercentage: number;
  amountNeeded: number;
  progressPercentage: number;
}

export interface PoolLiveProgress {
  totalParticipants: number;
  totalParticipations: number;
  combinedEligibleCartValue: number;
  accumulatedAmount: number;
  totalProductQuantity: number;
  targetMetric?: string;
  targetAmount: number;
  remainingTargetAmount: number;
  targetReached: boolean;
  targetEverReached: boolean;
  currentDiscountPercentage: number;
  currentTier: any;
  nextTier: PoolNextTier | null;
  nextTargetAmount: number;
  remainingAmountToNextTarget: number;
  nextDiscountPercentage: number;
  overallTargetAmount: number;
  overallProgressPercentage: number;
  tiersProgress: PoolTierProgress[];
  startsAt: string;
  endsAt: string;
  hasStarted: boolean;
  hasEnded: boolean;
  timeRemainingSeconds?: number;
  secondsUntilStart?: number;
}

export interface PoolLiveStatus {
  poolId: string;
  storeId: string;
  title: string;
  status: PoolStatus;
  isFinalized: boolean;
  finalDiscountPercentage: number | null;
  progress: PoolLiveProgress;
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
  liveStatus?: PoolLiveStatus;
  progress?: PoolLiveProgress;
}

export interface PoolParticipationRecord {
  id: string;
  poolId: string;
  cartId: string;
  userId: string;
  storeId: string;
  itemsSnapshot: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  status: 'SUBMITTED' | 'COMMITTED' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
  eligibleCartValue: number;
  appliedDiscountPercentage: number;
  finalDiscountAmount?: number;
  joinedAt: string;
}
