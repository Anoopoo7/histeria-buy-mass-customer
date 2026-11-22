import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  CORRELATION_ID_HEADER,
  CorrelationIdService,
} from '../services/correlation-id.service';
import { correlationIdInterceptor } from './correlation-id.interceptor';

describe('correlationIdInterceptor (Customer)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let correlationService: CorrelationIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CorrelationIdService,
        provideHttpClient(withInterceptors([correlationIdInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    correlationService = TestBed.inject(CorrelationIdService);
    correlationService.clear();
  });

  afterEach(() => {
    httpMock.verify();
    correlationService.clear();
  });

  it('should attach x-correlation-id header to customer outgoing request with a generated UUID', () => {
    http.get('/api/v1/pools').subscribe();

    const req = httpMock.expectOne('/api/v1/pools');
    const headerVal = req.request.headers.get(CORRELATION_ID_HEADER);

    expect(headerVal).toBeTruthy();
    expect(headerVal).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(correlationService.getCorrelationId()).toBe(headerVal!);

    req.flush({ data: [] });
  });

  it('should reuse saved correlation ID on subsequent requests', () => {
    correlationService.setCorrelationId('customer-session-corr-id');

    http.get('/api/v1/pools').subscribe();
    const req1 = httpMock.expectOne('/api/v1/pools');
    expect(req1.request.headers.get(CORRELATION_ID_HEADER)).toBe(
      'customer-session-corr-id',
    );
    req1.flush({ data: [] });

    http.get('/api/v1/cart').subscribe();
    const req2 = httpMock.expectOne('/api/v1/cart');
    expect(req2.request.headers.get(CORRELATION_ID_HEADER)).toBe(
      'customer-session-corr-id',
    );
    req2.flush({ items: [] });
  });

  it('should update saved correlation ID when server returns x-correlation-id in response', () => {
    http.get('/api/v1/products').subscribe();

    const req = httpMock.expectOne('/api/v1/products');
    const serverReturnedId = 'cust-server-assigned-corr-456';
    req.flush(
      { data: [] },
      {
        headers: new HttpHeaders({
          'x-correlation-id': serverReturnedId,
        }),
      },
    );

    expect(correlationService.getCorrelationId()).toBe(serverReturnedId);

    // Next request should use updated correlation ID
    http.get('/api/v1/cart').subscribe();
    const nextReq = httpMock.expectOne('/api/v1/cart');
    expect(nextReq.request.headers.get(CORRELATION_ID_HEADER)).toBe(
      serverReturnedId,
    );
    nextReq.flush({ items: [] });
  });

  it('should update saved correlation ID when server returns x-correlation-id in error response', () => {
    http.get('/api/v1/orders').subscribe({
      next: () => fail('Should have failed'),
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/v1/orders');
    const serverErrorId = 'cust-error-correlation-999';

    req.flush(
      { error: 'Server error' },
      {
        status: 500,
        statusText: 'Internal Error',
        headers: new HttpHeaders({
          'x-correlation-id': serverErrorId,
        }),
      },
    );

    expect(correlationService.getCorrelationId()).toBe(serverErrorId);
  });
});
