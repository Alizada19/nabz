import { PrismaService } from '../database/prisma.service';
export declare class BloodTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
    }[]>;
    findByName(name: string): Promise<{
        name: string;
        id: string;
    }>;
}
