import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormattedCart } from '../models/cart.model';
import { ApiClientService } from './api-client.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';

describe('CartService', () => {
  let service: CartService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockCarts: FormattedCart[] = [
    {
      id: 'cart_store_1',
      userId: 'user_123',
      store: { id: 'store_a', name: 'Fresh Mart Kadavanthra' },
      items: [
        {
          productId: 'prod_1',
          name: 'Coconut Oil 1L',
          image: null,
          quantity: 2,
          priceAtAddition: 220,
          currentPrice: 220,
          itemSubtotal: 440,
        },
      ],
      itemCount: 2,
      cartTotal: 440,
      status: 'ACTIVE',
      createdAt: '2026-11-15T10:00:00.000Z',
      updatedAt: '2026-11-15T10:00:00.000Z',
    },
    {
      id: 'cart_store_2',
      userId: 'user_123',
      store: { id: 'store_b', name: 'Kerala Spices Emporium' },
      items: [
        {
          productId: 'prod_2',
          name: 'Cardamom 250g',
          image: null,
          quantity: 1,
          priceAtAddition: 650,
          currentPrice: 650,
          itemSubtotal: 650,
        },
      ],
      itemCount: 1,
      cartTotal: 650,
      status: 'ACTIVE',
      createdAt: '2026-11-15T10:05:00.000Z',
      updatedAt: '2026-11-15T10:05:00.000Z',
    },
  ];

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'patch', 'delete']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'info', 'error']);

    authServiceSpy.isAuthenticated.and.returnValue(true);
    apiClientSpy.get.and.returnValue(of({ totalCarts: 2, carts: mockCarts }));

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: ApiClientService, useValue: apiClientSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    service = TestBed.inject(CartService);
  });

  it('should maintain strict store cart separation', (done) => {
    service.loadCarts().subscribe((carts) => {
      expect(carts.length).toBe(2);
      expect(service.totalStoreCount()).toBe(2);
      expect(service.totalItemCount()).toBe(3); // 2 + 1
      expect(service.getStoreCart('store_a')?.store.name).toBe('Fresh Mart Kadavanthra');
      expect(service.getStoreCart('store_b')?.store.name).toBe('Kerala Spices Emporium');
      done();
    });
  });

  it('should update item quantity via PATCH /api/v1/cart/items/:productId', (done) => {
    apiClientSpy.patch.and.returnValue(of({ message: 'Updated', cart: mockCarts[0] }));

    service.updateItemQuantity('prod_1', 3).subscribe(() => {
      expect(apiClientSpy.patch).toHaveBeenCalledWith('/api/v1/cart/items/prod_1', { quantity: 3 });
      done();
    });
  });

  it('should remove item via DELETE /api/v1/cart/items/:productId', (done) => {
    apiClientSpy.delete.and.returnValue(of({ message: 'Removed', cart: mockCarts[0] }));

    service.removeItem('prod_1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith('/api/v1/cart/items/prod_1');
      done();
    });
  });

  it('should clear store cart via DELETE /api/v1/cart/store/:storeId', (done) => {
    apiClientSpy.delete.and.returnValue(of({ message: 'Cleared' }));

    service.clearStoreCart('store_a').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith('/api/v1/cart/store/store_a');
      done();
    });
  });

  it('should fetch submitted carts via GET /api/v1/cart/submitted with store filter and pagination', (done) => {
    const mockSubmittedResponse = {
      data: [
        {
          id: 'cart-sub-1',
          userId: 'user_123',
          store: { id: 'store_a', name: 'Fresh Mart Kadavanthra', city: 'Kochi' },
          items: [
            {
              productId: 'prod_1',
              name: 'Coconut Oil 1L',
              image: null,
              quantity: 2,
              priceAtAddition: 220,
              currentPrice: 220,
              itemSubtotal: 440,
            },
          ],
          itemCount: 2,
          cartTotal: 440,
          status: 'SUBMITTED' as const,
          pool: {
            id: 'pool_xyz',
            title: 'Weekend sales',
            status: 'ACTIVE',
          },
          createdAt: '2026-11-15T10:00:00.000Z',
          updatedAt: '2026-11-15T10:00:00.000Z',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    apiClientSpy.get.and.returnValue(of(mockSubmittedResponse));

    service.getSubmittedCarts({ page: 1, limit: 10, storeId: 'store_a' }).subscribe((res) => {
      expect(apiClientSpy.get).toHaveBeenCalledWith('/api/v1/cart/submitted', {
        params: {
          page: 1,
          limit: 10,
          storeId: 'store_a',
          status: 'SUBMITTED',
        },
      });
      expect(res.data.length).toBe(1);
      expect(res.data[0].id).toBe('cart-sub-1');
      expect(res.data[0].status).toBe('SUBMITTED');
      expect(res.data[0].pool?.title).toBe('Weekend sales');
      done();
    });
  });

  it('should fetch single submitted cart by id via GET /api/v1/cart/submitted/:cartId', (done) => {
    const mockSingle = {
      cart: mockCarts[0],
    };

    apiClientSpy.get.and.returnValue(of(mockSingle));

    service.getSubmittedCartById('cart_store_1').subscribe((cart) => {
      expect(apiClientSpy.get).toHaveBeenCalledWith('/api/v1/cart/submitted/cart_store_1');
      expect(cart).toBeTruthy();
      expect(cart?.id).toBe('cart_store_1');
      done();
    });
  });
});
