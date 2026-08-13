import { PrismaService } from '../database/prisma.service';
import { BloodTypesService } from '../blood-types/blood-types.service';
import { CreateDonorProfileDto } from './dto/create-donor-profile.dto';
import { UpdateDonorProfileDto } from './dto/update-donor-profile.dto';
import { QueryDonorsDto } from './dto/query-donors.dto';
import { CreateDonorAdminDto } from './dto/create-donor-admin.dto';
import { UpdateDonorAdminDto } from './dto/update-donor-admin.dto';
export declare class DonorProfilesService {
    private readonly prisma;
    private readonly bloodTypesService;
    constructor(prisma: PrismaService, bloodTypesService: BloodTypesService);
    createForUser(userId: string, dto: CreateDonorProfileDto): Promise<{
        bloodType: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        availableStatus: boolean;
        lastDonationDate: Date | null;
        userId: string;
        bloodTypeId: string;
        totalDonations: number;
    }>;
    findByUserId(userId: string): Promise<{
        bloodType: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        availableStatus: boolean;
        lastDonationDate: Date | null;
        userId: string;
        bloodTypeId: string;
        totalDonations: number;
    }>;
    hasDonorProfile(userId: string): Promise<boolean>;
    update(userId: string, dto: UpdateDonorProfileDto): Promise<{
        bloodType: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        availableStatus: boolean;
        lastDonationDate: Date | null;
        userId: string;
        bloodTypeId: string;
        totalDonations: number;
    }>;
    removeForUser(userId: string): Promise<{
        message: string;
    }>;
    updateLocation(userId: string, latitude: number, longitude: number): Promise<{
        latitude: number | null;
        longitude: number | null;
        id: string;
    }>;
    findAllDonors(query: QueryDonorsDto): Promise<{
        items: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneDonor(id: string): Promise<any>;
    createDonorAdmin(dto: CreateDonorAdminDto): Promise<any>;
    updateDonorAdmin(id: string, dto: UpdateDonorAdminDto): Promise<any>;
    deleteDonorAdmin(id: string): Promise<{
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
    private toSafeUser;
}
