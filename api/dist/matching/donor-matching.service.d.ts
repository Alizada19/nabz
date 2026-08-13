import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { GeoService } from '../common/services/geo.service';
import { BloodCompatibilityService } from './blood-compatibility.service';
import { MatchedDonorDto } from './dto/matched-donor.dto';
export interface MatchDonorsParams {
    requiredBloodType: string;
    latitude: number;
    longitude: number;
    radiusKm?: number;
    page?: number;
    limit?: number;
}
export interface InternalMatchedDonor extends MatchedDonorDto {
    userId: string;
}
export declare class DonorMatchingService {
    private readonly prisma;
    private readonly geoService;
    private readonly compatibilityService;
    private readonly config;
    constructor(prisma: PrismaService, geoService: GeoService, compatibilityService: BloodCompatibilityService, config: ConfigService);
    findMatchingDonors(params: MatchDonorsParams): Promise<{
        items: InternalMatchedDonor[];
        total: number;
    }>;
    private toDisplayName;
    registerDonor(dto: any): Promise<any>;
    findDonorById(id: string): Promise<any>;
    updateDonor(id: string, dto: any): Promise<any>;
    deleteDonor(id: string): Promise<{
        name: string;
        email: string;
        phone: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        latitude: number | null;
        longitude: number | null;
        location: string | null;
        id: string;
        isAvailable: boolean;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listDonors(query: any): Promise<{
        items: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private toSafeUser;
}
