import { UrgencyLevel, RequestStatus, RequestType } from '@prisma/client';
export declare class UpdateBloodRequestDto {
    requestType?: RequestType;
    bloodType?: string;
    hospitalName?: string;
    hospitalAddress?: string;
    latitude?: number;
    longitude?: number;
    unitsRequired?: number;
    urgencyLevel?: UrgencyLevel;
    status?: RequestStatus;
    requesterPhone?: string;
    preferredHospital?: string;
    additionalNotes?: string;
    coordinatorName?: string;
    coordinatorContact?: string;
}
