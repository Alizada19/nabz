"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingModule = void 0;
const common_1 = require("@nestjs/common");
const blood_compatibility_service_1 = require("./blood-compatibility.service");
const donor_matching_service_1 = require("./donor-matching.service");
const donors_controller_1 = require("./donors.controller");
const geo_service_1 = require("../common/services/geo.service");
let MatchingModule = class MatchingModule {
};
exports.MatchingModule = MatchingModule;
exports.MatchingModule = MatchingModule = __decorate([
    (0, common_1.Module)({
        controllers: [donors_controller_1.DonorsController],
        providers: [blood_compatibility_service_1.BloodCompatibilityService, donor_matching_service_1.DonorMatchingService, geo_service_1.GeoService],
        exports: [blood_compatibility_service_1.BloodCompatibilityService, donor_matching_service_1.DonorMatchingService],
    })
], MatchingModule);
//# sourceMappingURL=matching.module.js.map