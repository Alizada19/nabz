import { Injectable } from '@nestjs/common';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Reusable geospatial utility service.
 * Implements the Haversine formula to compute great-circle distance
 * between two lat/lng points, in kilometers.
 */
@Injectable()
export class GeoService {
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Returns the distance in kilometers between two coordinates.
   */
  calculateDistanceKm(from: Coordinates, to: Coordinates): number {
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = GeoService.EARTH_RADIUS_KM * c;
    return Math.round(distance * 100) / 100; // 2 decimal places
  }

  isWithinRadius(from: Coordinates, to: Coordinates, radiusKm: number): boolean {
    return this.calculateDistanceKm(from, to) <= radiusKm;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
