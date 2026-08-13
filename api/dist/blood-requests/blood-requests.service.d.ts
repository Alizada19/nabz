import { Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BloodTypesService } from '../blood-types/blood-types.service';
import { DonorMatchingService } from '../matching/donor-matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { QueryBloodRequestDto } from './dto/query-blood-request.dto';
import { UpdateBloodRequestStatusDto } from './dto/update-status.dto';
import { UpdateBloodRequestDto } from './dto/update-blood-request.dto';
export declare class BloodRequestsService {
    private readonly prisma;
    private readonly bloodTypesService;
    private readonly donorMatchingService;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, bloodTypesService: BloodTypesService, donorMatchingService: DonorMatchingService, notificationsService: NotificationsService);
    create(requesterId: string, requesterRole: Role, dto: CreateBloodRequestDto): Promise<{
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
    }>;
    private matchAndNotify;
    findAll(query: QueryBloodRequestDto): Promise<{
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
    }>;
    findMyRequests(requesterId: string, query: QueryBloodRequestDto): Promise<{
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
    }>;
    findOne(id: string, requesterUserId: string, requesterRole: Role): Promise<{
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
    }>;
    update(id: string, requesterUserId: string, requesterRole: Role, dto: UpdateBloodRequestDto): Promise<{
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
    }>;
    remove(id: string, requesterUserId: string, requesterRole: Role): Promise<{
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
    }>;
    updateStatus(id: string, requesterUserId: string, requesterRole: Role, dto: UpdateBloodRequestStatusDto): Promise<{
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
    }>;
    private assertValidTransition;
}
