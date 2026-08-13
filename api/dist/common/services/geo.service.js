"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GeoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoService = void 0;
const common_1 = require("@nestjs/common");
let GeoService = GeoService_1 = class GeoService {
    calculateDistanceKm(from, to) {
        const dLat = this.toRadians(to.latitude - from.latitude);
        const dLon = this.toRadians(to.longitude - from.longitude);
        const lat1 = this.toRadians(from.latitude);
        const lat2 = this.toRadians(to.latitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = GeoService_1.EARTH_RADIUS_KM * c;
        return Math.round(distance * 100) / 100;
    }
    isWithinRadius(from, to, radiusKm) {
        return this.calculateDistanceKm(from, to) <= radiusKm;
    }
    toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }
};
exports.GeoService = GeoService;
GeoService.EARTH_RADIUS_KM = 6371;
exports.GeoService = GeoService = GeoService_1 = __decorate([
    (0, common_1.Injectable)()
], GeoService);
//# sourceMappingURL=geo.service.js.map