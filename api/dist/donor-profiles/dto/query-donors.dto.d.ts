import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryDonorsDto extends PaginationDto {
    bloodType?: string;
    isAvailable?: string;
    eligibility?: string;
    location?: string;
    search?: string;
}
