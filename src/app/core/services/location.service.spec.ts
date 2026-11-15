import { TestBed } from '@angular/core/testing';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [LocationService],
    });
    service = TestBed.inject(LocationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default 20 km discovery radius', () => {
    expect(service.radiusKm()).toBe(20);
  });

  it('should update and persist discovery radius', () => {
    service.setRadius(10);
    expect(service.radiusKm()).toBe(10);
    expect(localStorage.getItem('buymass_customer_radius')).toBe('10');
  });

  it('should update coordinates via map selection', () => {
    service.setCoordinates(9.9312, 76.2673, 'Kochi Point', 'map');
    const loc = service.currentLocation();
    expect(loc.latitude).toBe(9.9312);
    expect(loc.longitude).toBe(76.2673);
    expect(loc.source).toBe('map');
    expect(service.isLocationSet()).toBeTrue();
  });

  it('should support manual address entry', () => {
    service.setManualLocation({
      locality: 'Kadavanthra',
      city: 'Kochi',
      postalCode: '682020',
      label: 'My Home',
    });
    const loc = service.currentLocation();
    expect(loc.city).toBe('Kochi');
    expect(loc.locality).toBe('Kadavanthra');
    expect(loc.source).toBe('manual');
    expect(service.isLocationSet()).toBeTrue();
  });

  it('should support manual address entry with custom lat and long', () => {
    service.setManualLocation({
      locality: 'Marine Drive',
      city: 'Kochi',
      postalCode: '682031',
      latitude: 9.9754,
      longitude: 76.2758,
    });
    const loc = service.currentLocation();
    expect(loc.latitude).toBe(9.9754);
    expect(loc.longitude).toBe(76.2758);
    expect(loc.city).toBe('Kochi');
    expect(loc.locality).toBe('Marine Drive');
    expect(loc.source).toBe('manual');
    expect(service.isLocationSet()).toBeTrue();
  });

  it('should manage saved addresses (add, select, delete)', () => {
    const initialCount = service.savedAddresses().length;
    const added = service.saveAddress({
      type: 'HOME',
      title: 'Apartment',
      locality: 'Palarivattom',
      city: 'Kochi',
      postalCode: '682025',
      latitude: 10.002,
      longitude: 76.305,
    });

    expect(service.savedAddresses().length).toBe(initialCount + 1);

    service.selectSavedAddress(added.id);
    expect(service.currentLocation().addressLabel).toBe('Apartment');

    service.deleteSavedAddress(added.id);
    expect(service.savedAddresses().length).toBe(initialCount);
  });
});
