import { RequestStatus, UrgencyLevel, RequestType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryBloodRequestDto extends PaginationDto {
    status?: RequestStatus;
    urgencyLevel?: UrgencyLevel;
    bloodType?: string;
    location?: string;
    search?: string;
    requestType?: RequestType;
}
