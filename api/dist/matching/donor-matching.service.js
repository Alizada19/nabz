"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonorMatchingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const geo_service_1 = require("../common/services/geo.service");
const blood_compatibility_service_1 = require("./blood-compatibility.service");
const bcrypt = __importStar(require("bcrypt"));
let DonorMatchingService = class DonorMatchingService {
    constructor(prisma, geoService, compatibilityService, config) {
        this.prisma = prisma;
        this.geoService = geoService;
        this.compatibilityService = compatibilityService;
        this.config = config;
    }
    async findMatchingDonors(params) {
        const radiusKm = params.radiusKm ?? this.config.get('matching.defaultRadiusKm') ?? 50;
        const page = params.page ?? 1;
        const limit = params.limit ?? 10;
        const compatibleTypes = this.compatibilityService.getCompatibleDonorTypes(params.requiredBloodType);
        const candidateProfiles = await this.prisma.donorProfile.findMany({
            where: {
                availableStatus: true,
                bloodType: { name: { in: compatibleTypes } },
                user: {
                    isAvailable: true,
                    latitude: { not: null },
                    longitude: { not: null },
                },
            },
            include: {
                user: true,
                bloodType: true,
            },
        });
        const origin = { latitude: params.latitude, longitude: params.longitude };
        const withDistance = candidateProfiles
            .map((profile) => {
            const distanceKm = this.geoService.calculateDistanceKm(origin, {
                latitude: profile.user.latitude,
                longitude: profile.user.longitude,
            });
            return {
                userId: profile.userId,
                distanceKm,
                city: profile.user.location,
                availability: profile.availableStatus,
                bloodType: profile.bloodType.name,
                displayName: this.toDisplayName(profile.user.name),
            };
        })
            .filter((donor) => donor.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);
        const total = withDistance.length;
        const start = (page - 1) * limit;
        const items = withDistance.slice(start, start + limit);
        return { items, total };
    }
    toDisplayName(fullName) {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1)
            return parts[0];
        const first = parts[0];
        const lastInitial = parts[parts.length - 1][0];
        return `${first} ${lastInitial}.`;
    }
    async registerDonor(dto) {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { phone: dto.phone },
                ],
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Donor with this email or phone already exists');
        }
        const bloodType = await this.prisma.bloodType.findUnique({
            where: { name: dto.bloodType },
        });
        if (!bloodType) {
            throw new common_1.NotFoundException(`Blood type ${dto.bloodType} not found`);
        }
        const passwordHash = await bcrypt.hash(dto.password || 'Donor@12345', 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                password: passwordHash,
                role: 'individual',
                location: dto.location || null,
                latitude: dto.latitude || null,
                longitude: dto.longitude || null,
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
            },
        });
        const donorProfile = await this.prisma.donorProfile.create({
            data: {
                userId: user.id,
                bloodTypeId: bloodType.id,
                lastDonationDate: dto.lastDonationDate ? new Date(dto.lastDonationDate) : null,
                availableStatus: dto.availableStatus !== undefined ? dto.availableStatus : true,
            },
            include: { bloodType: true },
        });
        return {
            ...this.toSafeUser(user),
            donorProfile,
        };
    }
    async findDonorById(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, role: 'individual', donorProfile: { isNot: null } },
            include: {
                donorProfile: {
                    include: { bloodType: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Donor not found');
        }
        return this.toSafeUser(user);
    }
    async updateDonor(id, dto) {
        const user = await this.findDonorById(id);
        let bloodTypeId = user.donorProfile?.bloodTypeId;
        if (dto.bloodType) {
            const bt = await this.prisma.bloodType.findUnique({
                where: { name: dto.bloodType },
            });
            if (bt) {
                bloodTypeId = bt.id;
            }
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name !== undefined ? dto.name : undefined,
                email: dto.email !== undefined ? dto.email : undefined,
                phone: dto.phone !== undefined ? dto.phone : undefined,
                location: dto.location !== undefined ? dto.location : undefined,
                latitude: dto.latitude !== undefined ? dto.latitude : undefined,
                longitude: dto.longitude !== undefined ? dto.longitude : undefined,
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : undefined,
            },
        });
        const updatedProfile = await this.prisma.donorProfile.update({
            where: { userId: id },
            data: {
                bloodTypeId,
                lastDonationDate: dto.lastDonationDate !== undefined ? (dto.lastDonationDate ? new Date(dto.lastDonationDate) : null) : undefined,
                availableStatus: dto.availableStatus !== undefined ? dto.availableStatus : undefined,
            },
            include: { bloodType: true },
        });
        return {
            ...this.toSafeUser(updatedUser),
            donorProfile: updatedProfile,
        };
    }
    async deleteDonor(id) {
        await this.findDonorById(id);
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async listDonors(query) {
        const { page = 1, limit = 10, bloodType, availability, eligibility, location, search } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            role: 'individual',
            donorProfile: { isNot: null },
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }
        const donorProfileWhere = {};
        let hasDonorProfileFilter = false;
        if (bloodType) {
            donorProfileWhere.bloodType = {
                name: { equals: bloodType, mode: 'insensitive' },
            };
            hasDonorProfileFilter = true;
        }
        if (availability !== undefined && availability !== '') {
            const isAvail = availability === 'true' || availability === true;
            donorProfileWhere.availableStatus = isAvail;
            hasDonorProfileFilter = true;
        }
        if (eligibility) {
            const threshold = new Date();
            threshold.setDate(threshold.getDate() - 56);
            if (eligibility === 'eligible') {
                donorProfileWhere.OR = [
                    { lastDonationDate: null },
                    { lastDonationDate: { lte: threshold } },
                ];
            }
            else if (eligibility === 'ineligible') {
                donorProfileWhere.lastDonationDate = { gt: threshold };
            }
            hasDonorProfileFilter = true;
        }
        if (hasDonorProfileFilter) {
            where.donorProfile = donorProfileWhere;
        }
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    donorProfile: {
                        include: { bloodType: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items: items.map((u) => this.toSafeUser(u)),
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }
    toSafeUser(user) {
        const { password, refreshToken, ...safe } = user;
        return safe;
    }
};
exports.DonorMatchingService = DonorMatchingService;
exports.DonorMatchingService = DonorMatchingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        geo_service_1.GeoService,
        blood_compatibility_service_1.BloodCompatibilityService,
        config_1.ConfigService])
], DonorMatchingService);
//# sourceMappingURL=donor-matching.service.js.map