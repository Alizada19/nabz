import { PrismaService } from '../database/prisma.service';
import { FcmProvider } from './fcm.provider';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class NotificationsService {
    private readonly prisma;
    private readonly fcmProvider;
    constructor(prisma: PrismaService, fcmProvider: FcmProvider);
    create(dto: CreateNotificationDto): Promise<{
        title: string;
        message: string;
        id: string;
        createdAt: Date;
        userId: string;
        readAt: Date | null;
    }>;
    notifyMany(userIds: string[], title: string, message: string): Promise<void>;
    findForUser(userId: string, pagination: PaginationDto): Promise<{
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
    }>;
    markAsRead(id: string, userId: string): Promise<{
        title: string;
        message: string;
        id: string;
        createdAt: Date;
        userId: string;
        readAt: Date | null;
    }>;
}
