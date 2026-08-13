import { BloodInventoryService } from './blood-inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class BloodInventoryController {
    private readonly bloodInventoryService;
    constructor(bloodInventoryService: BloodInventoryService);
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
