import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { LocationService } from './location.service';
import { StoreService } from './store.service';

describe('StoreService', () => {
  let service: StoreService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockStoreResponse = {
    store: {
      id: '6ca46178-b415-460e-bbf5-f077f27ce453',
      storeName: 'Amal Super store',
      description: 'Maruthi Cars Showroom',
      businessType: 'Vehicles',
      addressLine1: 'Marine Drive, Shanmugham Road',
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      postalCode: '682120',
      country: 'IN',
      location: {
        latitude: 19.9816,
        longitude: 86.2999,
      },
      primaryImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      photos: [
        {
          id: 'a027e076-7c9d-455d-83da-d457356567cf',
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
          category: 'EXTERIOR',
        },
        {
          id: '884bd1fb-acf6-47d5-8db4-a3a1f8a41692',
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?photo=2',
          category: 'EXTERIOR',
        },
      ],
      status: 'APPROVED',
      createdAt: '2026-11-08T19:20:53.623Z',
      updatedAt: '2026-11-08T19:24:15.334Z',
    },
  };

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        StoreService,
        { provide: ApiClientService, useValue: apiClientSpy },
        {
          provide: LocationService,
          useValue: {
            currentLocation: () => ({ latitude: 9.9312, longitude: 76.2673, radiusKm: 20 }),
          },
        },
      ],
    });
    service = TestBed.inject(StoreService);
  });

  it('should fetch store details from /api/v1/stores/:storeId and map coordinates and photos', (done) => {
    apiClientSpy.get.and.returnValue(of(mockStoreResponse));

    service.getStoreById('6ca46178-b415-460e-bbf5-f077f27ce453').subscribe((store) => {
      expect(apiClientSpy.get).toHaveBeenCalledWith('/api/v1/stores/6ca46178-b415-460e-bbf5-f077f27ce453');
      expect(store).toBeTruthy();
      expect(store?.storeName).toBe('Amal Super store');
      expect(store?.businessType).toBe('Vehicles');
      expect(store?.latitude).toBe(19.9816);
      expect(store?.longitude).toBe(86.2999);
      expect(store?.imageUrls?.length).toBe(2);
      expect(store?.district).toBe('Ernakulam');
      done();
    });
  });
});
