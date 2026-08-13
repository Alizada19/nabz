import { BloodRequestsService } from './blood-requests.service';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { QueryBloodRequestDto } from './dto/query-blood-request.dto';
import { UpdateBloodRequestStatusDto } from './dto/update-status.dto';
import { UpdateBloodRequestDto } from './dto/update-blood-request.dto';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
export declare class BloodRequestsController {
    private readonly bloodRequestsService;
    constructor(bloodRequestsService: BloodRequestsService);
    create(user: AuthenticatedUser, dto: CreateBloodRequestDto): Promise<{
        message: string;
        data: {
            bloodType: {
                name: string;
                id: string;
            };
            requester: {
                name: string;
                role: import("@prisma/client").$Enums.Role;
                id: string;
            };
        } & {
            latitude: number | null;
            longitude: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bloodTypeId: string;
            requestType: import("@prisma/client").$Enums.RequestType;
            hospitalName: string | null;
            hospitalAddress: string | null;
            unitsRequired: number | null;
            urgencyLevel: import("@prisma/client").$Enums.UrgencyLevel;
            requesterPhone: string | null;
            preferredHospital: string | null;
            additionalNotes: string | null;
            coordinatorName: string | null;
            coordinatorContact: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            requesterId: string;
        };
    }>;
    findAll(query: QueryBloodRequestDto): Promise<{
        message: string;
        data: {
            items: ({
                bloodType: {
                    name: string;
                    id: string;
                };
                requester: {
                    name: string;
                    email: string;
                    phone: string;
                    role: import("@prisma/client").$Enums.Role;
                    location: string | null;
                    id: string;
                };
            } & {
                latitude: number | null;
                longitude: number | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bloodTypeId: string;
                requestType: import("@prisma/client").$Enums.RequestType;
                hospitalName: string | null;
                hospitalAddress: string | null;
                unitsRequired: number | null;
                urgencyLevel: import("@prisma/client").$Enums.UrgencyLevel;
                requesterPhone: string | null;
                preferredHospital: string | null;
                additionalNotes: string | null;
                coordinatorName: string | null;
                coordinatorContact: string | null;
                status: import("@prisma/client").$Enums.RequestStatus;
                requesterId: string;
            })[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findMine(user: AuthenticatedUser, query: QueryBloodRequestDto): Promise<{
        message: string;
        data: {
            items: ({
                bloodType: {
                    name: string;
                    id: string;
                };
                requester: {
                    name: string;
                    role: import("@prisma/client").$Enums.Role;
                    id: string;
                };
            } & {
                latitude: number | null;
                longitude: number | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bloodTypeId: string;
                requestType: import("@prisma/client").$Enums.RequestType;
                hospitalName: string | null;
                hospitalAddress: string | null;
                unitsRequired: number | null;
                urgencyLevel: import("@prisma/client").$Enums.UrgencyLevel;
                requesterPhone: string | null;
                preferredHospital: string | null;
                additionalNotes: string | null;
                coordinatorName: string | null;
                coordinatorContact: string | null;
                status: import("@prisma/client").$Enums.RequestStatus;
                requesterId: string;
            })[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        message: string;
        data: {
            bloodType: {
                name: string;
                id: string;
            };
            requester: {
                name: string;
                email: string;
                phone: string;
                role: import("@prisma/client").$Enums.Role;
                location: string | null;
                id: string;
            };
        } & {
            latitude: number | null;
            longitude: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bloodTypeId: string;
            requestType: import("@prisma/client").$Enums.RequestType;
            hospitalName: string | null;
            hospitalAddress: string | null;
            unitsRequired: number | null;
            urgencyLevel: import("@prisma/client").$Enums.UrgencyLevel;
            requesterPhone: string | null;
            preferredHospital: string | null;
            additionalNotes: string | null;
            coordinatorName: string | null;
            coordinatorContact: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            requesterId: string;
        };
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateBloodRequestDto): Promise<{
        message: string;
        data: {
            bloodType: {
                name: string;
                id: string;
            };
            requester: {
                name: string;
                role: import("@prisma/client").$Enums.Role;
                id: string;
            };
        } & {
            latitude: number | null;
            longitude: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bloodTypeId: string;
            requestType: import("@prisma/client").$Enums.RequestType;
            hospitalName: string | null;
            hospitalAddress: string | null;
            unitsRequired: number | null;
            urgencyLevel: import("@prisma/client").$Enums.UrgencyLevel;
            requesterPhone: string | null;
            preferredHospital: string | null;
            additionalNotes: string | null;
            coordinatorName: string | null;
            coordinatorContact: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            requesterId: string;
        };
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    updateStatus(user: AuthenticatedUser, id: string, dto: UpdateBloodRequestStatusDto): Promise<{
        message: string;
        data: {
            bloodType: {
                name: string;
                id: string;
            };
            requester: {
                name: string;
                role: import("@prisma/client").$Enums.Role;
                id: string;
            };
        } & {
            latitude: number | null;
            longitude: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bloodTypeId: string;
            requestType: import("@prisma/client").$Enums.RequestType;
            hospitalName: string | null;
            hospitalAddress: string | null;
            unitsRequired: number | null;
            urgencyLevel: import("@prisma/client").$Enums.UrgencyLevel;
            requesterPhone: string | null;
            preferredHospital: string | null;
            additionalNotes: string | null;
            coordinatorName: string | null;
            coordinatorContact: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            requesterId: string;
        };
    }>;
}
