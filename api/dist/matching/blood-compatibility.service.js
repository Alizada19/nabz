"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BloodCompatibilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodCompatibilityService = void 0;
const common_1 = require("@nestjs/common");
let BloodCompatibilityService = BloodCompatibilityService_1 = class BloodCompatibilityService {
    getCompatibleDonorTypes(requiredBloodType) {
        const normalized = this.normalize(requiredBloodType);
        const compatible = BloodCompatibilityService_1.COMPATIBILITY_MAP[normalized];
        if (!compatible) {
            throw new Error(`Unknown blood type: ${requiredBloodType}`);
        }
        return [...compatible];
    }
    isCompatible(donorType, requiredBloodType) {
        return this.getCompatibleDonorTypes(requiredBloodType).includes(this.normalize(donorType));
    }
    getAllValidBloodTypes() {
        return [...BloodCompatibilityService_1.VALID_TYPES];
    }
    isValidBloodType(bloodType) {
        return BloodCompatibilityService_1.VALID_TYPES.includes(this.normalize(bloodType));
    }
    normalize(bloodType) {
        return bloodType?.trim().toUpperCase();
    }
};
exports.BloodCompatibilityService = BloodCompatibilityService;
BloodCompatibilityService.COMPATIBILITY_MAP = Object.freeze({
    'O-': ['O-'],
    'O+': ['O+', 'O-'],
    'A-': ['A-', 'O-'],
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
});
BloodCompatibilityService.VALID_TYPES = Object.keys(BloodCompatibilityService_1.COMPATIBILITY_MAP);
exports.BloodCompatibilityService = BloodCompatibilityService = BloodCompatibilityService_1 = __decorate([
    (0, common_1.Injectable)()
], BloodCompatibilityService);
//# sourceMappingURL=blood-compatibility.service.js.map