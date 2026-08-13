import { DonorProfilesService } from './donor-profiles.service';
import { CreateDonorProfileDto } from './dto/create-donor-profile.dto';
import { UpdateDonorProfileDto } from './dto/update-donor-profile.dto';
import { QueryDonorsDto } from './dto/query-donors.dto';
import { CreateDonorAdminDto } from './dto/create-donor-admin.dto';
import { UpdateDonorAdminDto } from './dto/update-donor-admin.dto';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
export declare class DonorProfilesController {
    private readonly donorProfilesService;
    constructor(donorProfilesService: DonorProfilesService);
    create(user: AuthenticatedUser, dto: CreateDonorProfileDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: {
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
        };
    }>;
    updateMine(user: AuthenticatedUser, dto: UpdateDonorProfileDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    updateLocation(user: AuthenticatedUser, body: {
        latitude: number;
        longitude: number;
    }): Promise<{
        message: string;
        data: {
            latitude: number | null;
            longitude: number | null;
            id: string;
        };
    }>;
    removeMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: {
            message: string;
        };
    }>;
    findAllDonors(query: QueryDonorsDto): Promise<{
        message: string;
        data: {
            items: any[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findOneDonor(id: string): Promise<{
        message: string;
        data: any;
    }>;
    createDonor(dto: CreateDonorAdminDto): Promise<{
        message: string;
        data: any;
    }>;
    updateDonor(id: string, dto: UpdateDonorAdminDto): Promise<{
        message: string;
        data: any;
    }>;
    deleteDonor(id: string): Promise<{
        message: string;
    }>;
}
