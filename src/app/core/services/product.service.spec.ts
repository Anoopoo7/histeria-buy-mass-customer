import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { LocationService } from './location.service';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockProductResponse = {
    product: {
      id: 'prod-123',
      storeId: 'store-456',
      storeName: 'Kochi Fresh Grocery',
      name: 'Kerala Matta Rice (5kg)',
      description: 'Premium Palakkadan Matta Rice',
      category: 'Groceries',
      brand: 'Double Horse',
      sku: 'DH-MATTA-5KG',
      price: 320,
      originalPrice: 380,
      unit: '5kg bag',
      primaryImageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
      images: [
        { id: '1', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c' },
        { id: '2', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?v=2' },
      ],
      status: 'ACTIVE',
    },
  };

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: ApiClientService, useValue: apiClientSpy },
        {
          provide: LocationService,
          useValue: {
            currentLocation: () => ({ latitude: 9.9312, longitude: 76.2673, radiusKm: 20 }),
          },
        },
      ],
    });
    service = TestBed.inject(ProductService);
  });

  it('should fetch product details from /api/v1/products/:id and normalize fields', (done) => {
    apiClientSpy.get.and.returnValue(of(mockProductResponse));

    service.getProductById('prod-123').subscribe((prod) => {
      expect(apiClientSpy.get).toHaveBeenCalledWith('/api/v1/products/prod-123');
      expect(prod).toBeTruthy();
      expect(prod?.name).toBe('Kerala Matta Rice (5kg)');
      expect(prod?.price).toBe(320);
      expect(prod?.originalPrice).toBe(380);
      expect(prod?.brand).toBe('Double Horse');
      expect(prod?.imageUrls?.length).toBe(2);
      expect(prod?.unit).toBe('5kg bag');
      done();
    });
  });

  it('should handle backend product response with embedded store details', (done) => {
    const backendResponse = {
      product: {
        id: '236e9516-5089-4faf-8a3a-9f381ba142d0',
        storeId: '6ca46178-b415-460e-bbf5-f077f27ce453',
        name: 'PUNCH',
        description: 'regular car',
        category: 'Dairy & Bakery',
        brand: 'Maruthi',
        sku: 'MR-PUNCH-XL',
        price: 780000,
        unit: 'g',
        primaryImageUrl: 'https://res.cloudinary.com/djwecjdib/image/upload/v1794585962/buymass/products/pz2x01ncwjdv551omrxr.png',
        images: [
          {
            id: '74e89324-13ca-43c3-84e7-a47401ba5787',
            url: 'https://res.cloudinary.com/djwecjdib/image/upload/v1794585962/buymass/products/pz2x01ncwjdv551omrxr.png',
          },
        ],
        status: 'ACTIVE',
        store: {
          id: '6ca46178-b415-460e-bbf5-f077f27ce453',
          storeName: 'Amal Super store',
          city: 'Kochi',
          district: 'Ernakulam',
          state: 'Kerala',
          location: {
            latitude: 19.9816,
            longitude: 86.2999,
          },
          primaryImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        },
        createdAt: '2026-11-13T16:05:49.754Z',
        updatedAt: '2026-11-13T16:06:09.613Z',
      },
    };

    apiClientSpy.get.and.returnValue(of(backendResponse));

    service.getProductById('236e9516-5089-4faf-8a3a-9f381ba142d0').subscribe((prod) => {
      expect(apiClientSpy.get).toHaveBeenCalledWith('/api/v1/products/236e9516-5089-4faf-8a3a-9f381ba142d0');
      expect(prod).toBeTruthy();
      expect(prod?.id).toBe('236e9516-5089-4faf-8a3a-9f381ba142d0');
      expect(prod?.name).toBe('PUNCH');
      expect(prod?.price).toBe(780000);
      expect(prod?.brand).toBe('Maruthi');
      expect(prod?.sku).toBe('MR-PUNCH-XL');
      expect(prod?.storeId).toBe('6ca46178-b415-460e-bbf5-f077f27ce453');
      expect(prod?.storeName).toBe('Amal Super store');
      expect(prod?.storeCity).toBe('Kochi');
      expect(prod?.storeDistrict).toBe('Ernakulam');
      expect(prod?.store?.location?.latitude).toBe(19.9816);
      expect(prod?.store?.primaryImageUrl).toBe('https://images.unsplash.com/photo-1555396273-367ea4eb4db5');
      done();
    });
  });
});
