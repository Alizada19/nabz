import { UrgencyLevel, RequestType } from '@prisma/client';
export declare class CreateBloodRequestDto {
    requestType?: RequestType;
    bloodType: string;
    hospitalName?: string;
    hospitalAddress?: string;
    latitude?: number;
    longitude?: number;
    unitsRequired?: number;
    urgencyLevel?: UrgencyLevel;
    requesterPhone?: string;
    preferredHospital?: string;
    additionalNotes?: string;
    coordinatorName?: string;
    coordinatorContact?: string;
}
