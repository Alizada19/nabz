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
exports.DonorProfilesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const blood_types_service_1 = require("../blood-types/blood-types.service");
const bcrypt = __importStar(require("bcrypt"));
let DonorProfilesService = class DonorProfilesService {
    constructor(prisma, bloodTypesService) {
        this.prisma = prisma;
        this.bloodTypesService = bloodTypesService;
    }
    async createForUser(userId, dto) {
        const existing = await this.prisma.donorProfile.findUnique({
            where: { userId },
        });
        if (existing) {
            throw new common_1.ConflictException('Donor profile already exists for this user');
        }
        const bloodType = await this.bloodTypesService.findByName(dto.bloodType);
        return this.prisma.donorProfile.create({
            data: { userId, bloodTypeId: bloodType.id },
            include: { bloodType: true },
        });
    }
    async findByUserId(userId) {
        const profile = await this.prisma.donorProfile.findUnique({
            where: { userId },
            include: { bloodType: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Donor profile not found');
        }
        return profile;
    }
    async hasDonorProfile(userId) {
        const profile = await this.prisma.donorProfile.findUnique({
            where: { userId },
        });
        return !!profile;
    }
    async update(userId, dto) {
        const profile = await this.findByUserId(userId);
        let bloodTypeId = profile.bloodTypeId;
        if (dto.bloodType) {
            const bloodType = await this.bloodTypesService.findByName(dto.bloodType);
            bloodTypeId = bloodType.id;
        }
        if (dto.lastDonationDate && new Date(dto.lastDonationDate) > new Date()) {
            throw new common_1.BadRequestException('lastDonationDate cannot be in the future');
        }
        return this.prisma.donorProfile.update({
            where: { userId },
            data: {
                bloodTypeId,
                availableStatus: dto.availableStatus,
                lastDonationDate: dto.lastDonationDate
                    ? new Date(dto.lastDonationDate)
                    : undefined,
            },
            include: { bloodType: true },
        });
    }
    async removeForUser(userId) {
        const profile = await this.prisma.donorProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Donor profile not found');
        }
        await this.prisma.donorProfile.delete({
            where: { userId },
        });
        return { message: 'Donor profile removed. You can still create blood requests.' };
    }
    async updateLocation(userId, latitude, longitude) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { latitude, longitude },
            select: { id: true, latitude: true, longitude: true },
        });
    }
    async findAllDonors(query) {
        const { skip, limit = 10, bloodType, isAvailable, eligibility, location, search } = query;
        const where = {
            role: client_1.Role.individual,
            donorProfile: { isNot: null },
        };
        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }
        if (isAvailable !== undefined) {
            const isAvailBool = isAvailable === 'true';
            where.isAvailable = isAvailBool;
            where.donorProfile = {
                ...where.donorProfile,
                availableStatus: isAvailBool,
            };
        }
        if (bloodType) {
            where.donorProfile = {
                ...where.donorProfile,
                bloodType: {
                    name: {
                        equals: bloodType,
                        mode: 'insensitive',
                    },
                },
            };
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }
        const users = await this.prisma.user.findMany({
            where,
            include: {
                donorProfile: {
                    include: {
                        bloodType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const safeUsers = users.map((u) => this.toSafeUser(u));
        let filteredUsers = safeUsers;
        if (eligibility) {
            const now = new Date();
            const fiftySixDaysAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
            filteredUsers = safeUsers.filter((u) => {
                const lastDonation = u.donorProfile?.lastDonationDate;
                const isEligible = !lastDonation || new Date(lastDonation) < fiftySixDaysAgo;
                return eligibility === 'eligible' ? isEligible : !isEligible;
            });
        }
        const total = filteredUsers.length;
        const paginated = filteredUsers.slice(skip, skip + limit);
        return {
            items: paginated,
            meta: {
                total,
                page: query.page ?? 1,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOneDonor(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                donorProfile: {
                    include: {
                        bloodType: true,
                    },
                },
            },
        });
        if (!user || !user.donorProfile) {
            throw new common_1.NotFoundException('Donor not found');
        }
        return this.toSafeUser(user);
    }
    async createDonorAdmin(dto) {
        const existingEmail = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: dto.email }, { phone: dto.phone }],
            },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email or Phone is already registered');
        }
        const bloodType = await this.bloodTypesService.findByName(dto.bloodType);
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                password: hashedPassword,
                role: client_1.Role.individual,
                location: dto.location || 'Kuala Lumpur',
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
            },
        });
        const lastDonation = dto.lastDonationDate ? new Date(dto.lastDonationDate) : null;
        const donorProfile = await this.prisma.donorProfile.create({
            data: {
                userId: user.id,
                bloodTypeId: bloodType.id,
                availableStatus: dto.isAvailable !== undefined ? dto.isAvailable : true,
                lastDonationDate: lastDonation,
            },
            include: {
                bloodType: true,
            },
        });
        const safeUser = this.toSafeUser(user);
        return {
            ...safeUser,
            donorProfile,
        };
    }
    async updateDonorAdmin(id, dto) {
        const user = await this.findOneDonor(id);
        let hashedPassword = undefined;
        if (dto.password) {
            hashedPassword = await bcrypt.hash(dto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                password: hashedPassword,
                location: dto.location,
                isAvailable: dto.isAvailable,
            },
        });
        let bloodTypeId = user.donorProfile?.bloodTypeId;
        if (dto.bloodType) {
            const bt = await this.bloodTypesService.findByName(dto.bloodType);
            bloodTypeId = bt.id;
        }
        const lastDonation = dto.lastDonationDate !== undefined
            ? (dto.lastDonationDate ? new Date(dto.lastDonationDate) : null)
            : undefined;
        const donorProfile = await this.prisma.donorProfile.update({
            where: { userId: id },
            data: {
                bloodTypeId,
                availableStatus: dto.isAvailable !== undefined ? dto.isAvailable : undefined,
                lastDonationDate: lastDonation,
            },
            include: {
                bloodType: true,
            },
        });
        const safeUser = this.toSafeUser(updatedUser);
        return {
            ...safeUser,
            donorProfile,
        };
    }
    async deleteDonorAdmin(id) {
        await this.findOneDonor(id);
        return this.prisma.user.delete({
            where: { id },
        });
    }
    toSafeUser(user) {
        const { password, refreshToken, ...safe } = user;
        return safe;
    }
};
exports.DonorProfilesService = DonorProfilesService;
exports.DonorProfilesService = DonorProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blood_types_service_1.BloodTypesService])
], DonorProfilesService);
//# sourceMappingURL=donor-profiles.service.js.map