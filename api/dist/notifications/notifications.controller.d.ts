import { NotificationsService } from './notifications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findMine(user: AuthenticatedUser, pagination: PaginationDto): Promise<{
        message: string;
        data: {
            items: {
                title: string;
                message: string;
                id: string;
                createdAt: Date;
                userId: string;
                readAt: Date | null;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    markAsRead(user: AuthenticatedUser, id: string): Promise<{
        message: string;
        data: {
            title: string;
            message: string;
            id: string;
            createdAt: Date;
            userId: string;
            readAt: Date | null;
        };
    }>;
}
