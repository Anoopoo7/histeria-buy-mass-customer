import { TestBed } from '@angular/core/testing';
import { GoogleMapsLoaderService } from './google-maps-loader.service';

describe('GoogleMapsLoaderService', () => {
  let service: GoogleMapsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleMapsLoaderService],
    });
    service = TestBed.inject(GoogleMapsLoaderService);
  });

  it('should be created with idle status', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('idle');
  });

  it('should handle existing google.maps on window', async () => {
    (window as any).google = { maps: { Map: class {} } };
    const loaded = await service.load();
    expect(loaded).toBeTrue();
    expect(service.status()).toBe('loaded');
    delete (window as any).google;
  });

  it('should handle global gm_authFailure callback', () => {
    expect(typeof (window as any).gm_authFailure).toBe('function');
    (window as any).gm_authFailure();
    expect(service.status()).toBe('error');
    expect(service.errorMessage()).toContain('Google Maps authentication failed');
  });
});
