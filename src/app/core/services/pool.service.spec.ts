import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PoolRecord } from '../models/pool.model';
import { ApiClientService } from './api-client.service';
import { LocationService } from './location.service';
import { PoolService } from './pool.service';

describe('PoolService', () => {
  let service: PoolService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockStatusResponse = {
    status: {
      poolId: '15205d2a-5add-4e3a-a8d2-c2482060991e',
      storeId: '6ca46178-b415-460e-bbf5-f077f27ce453',
      title: 'Weekend sales',
      status: 'ACTIVE' as const,
      isFinalized: false,
      finalDiscountPercentage: null,
      progress: {
        totalParticipants: 5,
        totalParticipations: 5,
        combinedEligibleCartValue: 3000000,
        accumulatedAmount: 3000000,
        totalProductQuantity: 10,
        targetMetric: 'AMOUNT',
        targetAmount: 10000000,
        remainingTargetAmount: 7000000,
        targetReached: false,
        targetEverReached: false,
        currentDiscountPercentage: 10,
        currentTier: null,
        nextTier: {
          tierIndex: 2,
          targetAmount: 5000000,
          discountPercentage: 15,
          amountNeeded: 2000000,
          progressPercentage: 60,
        },
        nextTargetAmount: 5000000,
        remainingAmountToNextTarget: 2000000,
        nextDiscountPercentage: 15,
        overallTargetAmount: 10000000,
        overallProgressPercentage: 30,
        tiersProgress: [
          {
            tierIndex: 1,
            targetAmount: 2500000,
            discountPercentage: 10,
            isReached: true,
            isCurrent: true,
            remainingAmount: 0,
            progressPercentage: 100,
          },
          {
            tierIndex: 2,
            targetAmount: 5000000,
            discountPercentage: 15,
            isReached: false,
            isCurrent: false,
            remainingAmount: 2000000,
            progressPercentage: 60,
          },
        ],
        startsAt: '2026-11-13T16:30:00.000Z',
        endsAt: '2026-11-20T16:30:00.000Z',
        hasStarted: true,
        hasEnded: false,
      },
    },
  };

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        PoolService,
        { provide: ApiClientService, useValue: apiClientSpy },
        {
          provide: LocationService,
          useValue: {
            currentLocation: () => ({ latitude: 9.9312, longitude: 76.2673, radiusKm: 20 }),
          },
        },
      ],
    });
    service = TestBed.inject(PoolService);
  });

  it('should fetch pool status from /api/v1/pools/:poolId/status', (done) => {
    apiClientSpy.get.and.returnValue(of(mockStatusResponse));

    service.getPoolStatus('15205d2a-5add-4e3a-a8d2-c2482060991e').subscribe((status) => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(
        '/api/v1/pools/15205d2a-5add-4e3a-a8d2-c2482060991e/status'
      );
      expect(status).toBeTruthy();
      expect(status?.progress.accumulatedAmount).toBe(3000000);
      expect(status?.progress.currentDiscountPercentage).toBe(10);
      done();
    });
  });

  it('should fetch multiple pools status in parallel and enrich them', (done) => {
    apiClientSpy.get.and.returnValue(of(mockStatusResponse));

    const inputPools: PoolRecord[] = [
      {
        id: 'pool-1',
        storeId: 'store-1',
        title: 'Pool 1',
        startsAt: '2026-11-13T16:30:00.000Z',
        endsAt: '2026-11-20T16:30:00.000Z',
        status: 'ACTIVE',
        targetAmount: 10000000,
        discountPercentage: 0,
        tiers: [],
        productIds: [],
      },
      {
        id: 'pool-2',
        storeId: 'store-2',
        title: 'Pool 2',
        startsAt: '2026-11-13T16:30:00.000Z',
        endsAt: '2026-11-20T16:30:00.000Z',
        status: 'ACTIVE',
        targetAmount: 10000000,
        discountPercentage: 0,
        tiers: [],
        productIds: [],
      },
    ];

    service.getPoolsWithLiveStatus(inputPools).subscribe((enriched) => {
      expect(apiClientSpy.get).toHaveBeenCalledTimes(2);
      expect(apiClientSpy.get).toHaveBeenCalledWith('/api/v1/pools/pool-1/status');
      expect(apiClientSpy.get).toHaveBeenCalledWith('/api/v1/pools/pool-2/status');

      expect(enriched.length).toBe(2);
      expect(enriched[0].currentTotalAmount).toBe(3000000);
      expect(enriched[0].currentParticipantCount).toBe(5);
      expect(enriched[0].discountPercentage).toBe(10);
      expect(enriched[0].progress?.overallProgressPercentage).toBe(30);
      done();
    });
  });
});
