"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const fcm_provider_1 = require("./fcm.provider");
let NotificationsService = class NotificationsService {
    constructor(prisma, fcmProvider) {
        this.prisma = prisma;
        this.fcmProvider = fcmProvider;
    }
    async create(dto) {
        const notification = await this.prisma.notification.create({
            data: dto,
        });
        await this.fcmProvider.send({
            userId: dto.userId,
            title: dto.title,
            body: dto.message,
        });
        return notification;
    }
    async notifyMany(userIds, title, message) {
        if (userIds.length === 0)
            return;
        await this.prisma.notification.createMany({
            data: userIds.map((userId) => ({ userId, title, message })),
        });
        await this.fcmProvider.sendBatch(userIds.map((userId) => ({ userId, title, body: message })));
    }
    async findForUser(userId, pagination) {
        const { skip, limit = 10 } = pagination;
        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            items,
            meta: {
                total,
                page: pagination.page ?? 1,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id },
            data: { readAt: new Date() },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fcm_provider_1.FcmProvider])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map