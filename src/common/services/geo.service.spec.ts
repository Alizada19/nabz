import { GeoService } from './geo.service';

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(() => {
    service = new GeoService();
  });

  it('returns 0 for identical coordinates', () => {
    const point = { latitude: 3.139, longitude: 101.6869 };
    expect(service.calculateDistanceKm(point, point)).toBe(0);
  });

  it('calculates approximate distance between Kuala Lumpur and Petaling Jaya', () => {
    const kualaLumpur = { latitude: 3.139, longitude: 101.6869 };
    const petalingJaya = { latitude: 3.1073, longitude: 101.6067 };
    const distance = service.calculateDistanceKm(kualaLumpur, petalingJaya);
    // Real-world distance is roughly 9-10km
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(15);
  });

  it('calculates a known long distance (KL to Singapore) within tolerance', () => {
    const kualaLumpur = { latitude: 3.139, longitude: 101.6869 };
    const singapore = { latitude: 1.3521, longitude: 103.8198 };
    const distance = service.calculateDistanceKm(kualaLumpur, singapore);
    // Real-world distance is roughly 315km
    expect(distance).toBeGreaterThan(280);
    expect(distance).toBeLessThan(350);
  });

  it('isWithinRadius correctly filters near vs far points', () => {
    const origin = { latitude: 3.139, longitude: 101.6869 };
    const near = { latitude: 3.14, longitude: 101.69 };
    const far = { latitude: 1.3521, longitude: 103.8198 };

    expect(service.isWithinRadius(origin, near, 50)).toBe(true);
    expect(service.isWithinRadius(origin, far, 50)).toBe(false);
  });
});
