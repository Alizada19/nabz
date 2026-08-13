import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
export declare class HospitalsController {
    private readonly hospitalsService;
    constructor(hospitalsService: HospitalsService);
    create(dto: CreateHospitalDto): Promise<{
        name: string;
        email: string;
        phone: string;
        latitude: number;
        longitude: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
    }>;
    findAll(search?: string, page?: number, limit?: number): Promise<{
        items: {
            name: string;
            email: string;
            phone: string;
            latitude: number;
            longitude: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        name: string;
        email: string;
        phone: string;
        latitude: number;
        longitude: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
    }>;
    update(id: string, dto: UpdateHospitalDto): Promise<{
        name: string;
        email: string;
        phone: string;
        latitude: number;
        longitude: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
    }>;
    remove(id: string): Promise<{
        name: string;
        email: string;
        phone: string;
        latitude: number;
        longitude: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
    }>;
}
