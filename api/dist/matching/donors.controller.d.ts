import { DonorMatchingService } from './donor-matching.service';
import { NearbyDonorsQueryDto } from './dto/nearby-donors-query.dto';
export declare class DonorsController {
    private readonly donorMatchingService;
    constructor(donorMatchingService: DonorMatchingService);
    findNearby(query: NearbyDonorsQueryDto): Promise<{
        message: string;
        data: {
            items: {
                distanceKm: number;
                city: string | null;
                availability: boolean;
                bloodType: string;
                displayName: string;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    listDonors(query: any): Promise<{
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
    registerDonor(body: any): Promise<{
        message: string;
        data: any;
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: any;
    }>;
    update(id: string, body: any): Promise<{
        message: string;
        data: any;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
