import { PrismaService } from '../database/prisma.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class BloodInventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        bloodType: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bloodTypeId: string;
        unitsStored: number;
        minThreshold: number;
    })[]>;
    update(dto: UpdateInventoryDto): Promise<{
        bloodType: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bloodTypeId: string;
        unitsStored: number;
        minThreshold: number;
    }>;
}
