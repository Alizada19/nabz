export interface Coordinates {
    latitude: number;
    longitude: number;
}
export declare class GeoService {
    private static readonly EARTH_RADIUS_KM;
    calculateDistanceKm(from: Coordinates, to: Coordinates): number;
    isWithinRadius(from: Coordinates, to: Coordinates, radiusKm: number): boolean;
    private toRadians;
}
