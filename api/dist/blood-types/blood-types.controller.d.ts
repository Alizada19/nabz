import { BloodTypesService } from './blood-types.service';
export declare class BloodTypesController {
    private readonly bloodTypesService;
    constructor(bloodTypesService: BloodTypesService);
    findAll(): Promise<{
        message: string;
        data: {
            name: string;
            id: string;
        }[];
    }>;
}
