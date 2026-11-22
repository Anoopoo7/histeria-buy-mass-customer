import { TestBed } from '@angular/core/testing';
import {
  CORRELATION_ID_STORAGE_KEY,
  CorrelationIdService,
} from './correlation-id.service';

describe('CorrelationIdService', () => {
  let service: CorrelationIdService;

  beforeEach(() => {
    sessionStorage.removeItem(CORRELATION_ID_STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [CorrelationIdService],
    });
    service = TestBed.inject(CorrelationIdService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should generate and save a new UUID if none exists', () => {
    expect(service.getSavedCorrelationId()).toBeNull();
    const id = service.getCorrelationId();

    expect(id).toBeTruthy();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(service.getSavedCorrelationId()).toBe(id);
    expect(sessionStorage.getItem(CORRELATION_ID_STORAGE_KEY)).toBe(id);
  });

  it('should return the same ID on subsequent calls', () => {
    const id1 = service.getCorrelationId();
    const id2 = service.getCorrelationId();
    expect(id2).toBe(id1);
  });

  it('should load pre-existing ID from sessionStorage', () => {
    sessionStorage.setItem(CORRELATION_ID_STORAGE_KEY, 'customer-preexisting-id-456');
    const freshService = new CorrelationIdService();
    expect(freshService.getCorrelationId()).toBe('customer-preexisting-id-456');
  });

  it('should update and persist ID when setCorrelationId is called', () => {
    service.setCorrelationId('customer-server-correlation-id-789');
    expect(service.getCorrelationId()).toBe('customer-server-correlation-id-789');
    expect(sessionStorage.getItem(CORRELATION_ID_STORAGE_KEY)).toBe(
      'customer-server-correlation-id-789',
    );
  });

  it('should ignore empty or invalid IDs in setCorrelationId', () => {
    service.setCorrelationId('valid-id');
    service.setCorrelationId('');
    service.setCorrelationId('   ');
    expect(service.getCorrelationId()).toBe('valid-id');
  });

  it('should clear stored correlation ID on clear()', () => {
    service.setCorrelationId('temp-id');
    expect(service.getSavedCorrelationId()).toBe('temp-id');

    service.clear();
    expect(service.getSavedCorrelationId()).toBeNull();
    expect(sessionStorage.getItem(CORRELATION_ID_STORAGE_KEY)).toBeNull();
  });
});
