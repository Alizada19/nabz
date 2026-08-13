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
var BloodRequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodRequestsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const blood_types_service_1 = require("../blood-types/blood-types.service");
const donor_matching_service_1 = require("../matching/donor-matching.service");
const notifications_service_1 = require("../notifications/notifications.service");
let BloodRequestsService = BloodRequestsService_1 = class BloodRequestsService {
    constructor(prisma, bloodTypesService, donorMatchingService, notificationsService) {
        this.prisma = prisma;
        this.bloodTypesService = bloodTypesService;
        this.donorMatchingService = donorMatchingService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(BloodRequestsService_1.name);
    }
    async create(requesterId, requesterRole, dto) {
        const allowedRoles = [
            client_1.Role.individual,
            client_1.Role.hospital,
            client_1.Role.blood_bank,
            client_1.Role.ngo,
            client_1.Role.admin,
        ];
        if (!allowedRoles.includes(requesterRole)) {
            throw new common_1.ForbiddenException('Your account type is not permitted to create blood requests');
        }
        const bloodType = await this.bloodTypesService.findByName(dto.bloodType);
        const request = await this.prisma.bloodRequest.create({
            data: {
                requesterId,
                bloodTypeId: bloodType.id,
                requestType: dto.requestType || 'INDIVIDUAL',
                hospitalName: dto.hospitalName || null,
                hospitalAddress: dto.hospitalAddress || null,
                latitude: dto.latitude !== undefined ? dto.latitude : null,
                longitude: dto.longitude !== undefined ? dto.longitude : null,
                unitsRequired: dto.unitsRequired !== undefined ? dto.unitsRequired : null,
                urgencyLevel: dto.urgencyLevel || 'medium',
                requesterPhone: dto.requesterPhone || null,
                preferredHospital: dto.preferredHospital || null,
                additionalNotes: dto.additionalNotes || null,
                coordinatorName: dto.coordinatorName || null,
                coordinatorContact: dto.coordinatorContact || null,
            },
            include: {
                bloodType: true,
                requester: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });
        if (dto.latitude !== undefined && dto.longitude !== undefined) {
            this.matchAndNotify(request.id, bloodType.name, dto.latitude, dto.longitude).catch((err) => this.logger.error(`Matching/notification workflow failed for request ${request.id}: ${err.message}`));
        }
        return request;
    }
    async matchAndNotify(requestId, bloodTypeName, latitude, longitude) {
        const { items } = await this.donorMatchingService.findMatchingDonors({
            requiredBloodType: bloodTypeName,
            latitude,
            longitude,
        });
        if (items.length === 0) {
            this.logger.log(`No compatible nearby donors found for request ${requestId}`);
            return;
        }
        const city = items[0]?.city ?? 'your area';
        await this.notificationsService.notifyMany(items.map((d) => d.userId), 'Emergency Blood Request', `A patient requires ${bloodTypeName} blood near ${city}. Units needed urgently.`);
    }
    async findAll(query) {
        const { skip, limit = 10, status, urgencyLevel, bloodType, location, search, requestType } = query;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (urgencyLevel) {
            where.urgencyLevel = urgencyLevel;
        }
        if (requestType) {
            where.requestType = requestType;
        }
        if (bloodType) {
            where.bloodType = {
                name: {
                    equals: bloodType,
                    mode: 'insensitive',
                },
            };
        }
        if (location) {
            where.OR = [
                { hospitalAddress: { contains: location, mode: 'insensitive' } },
                { hospitalName: { contains: location, mode: 'insensitive' } },
                { preferredHospital: { contains: location, mode: 'insensitive' } },
            ];
        }
        if (search) {
            where.OR = [
                { hospitalName: { contains: search, mode: 'insensitive' } },
                { hospitalAddress: { contains: search, mode: 'insensitive' } },
                { preferredHospital: { contains: search, mode: 'insensitive' } },
                { requester: { name: { contains: search, mode: 'insensitive' } } },
                { additionalNotes: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.bloodRequest.findMany({
                where,
                include: {
                    bloodType: true,
                    requester: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            role: true,
                            location: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.bloodRequest.count({ where }),
        ]);
        return {
            items,
            meta: {
                total,
                page: query.page ?? 1,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findMyRequests(requesterId, query) {
        const { skip, limit = 10, status } = query;
        const where = { requesterId, ...(status ? { status } : {}) };
        const [items, total] = await Promise.all([
            this.prisma.bloodRequest.findMany({
                where,
                include: {
                    bloodType: true,
                    requester: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.bloodRequest.count({ where }),
        ]);
        return {
            items,
            meta: {
                total,
                page: query.page ?? 1,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, requesterUserId, requesterRole) {
        const request = await this.prisma.bloodRequest.findUnique({
            where: { id },
            include: {
                bloodType: true,
                requester: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        email: true,
                        phone: true,
                        location: true,
                    },
                },
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Blood request not found');
        }
        if (requesterRole !== client_1.Role.admin && request.requesterId !== requesterUserId) {
            throw new common_1.ForbiddenException('You do not have access to this request');
        }
        return request;
    }
    async update(id, requesterUserId, requesterRole, dto) {
        const request = await this.prisma.bloodRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Blood request not found');
        }
        if (requesterRole !== client_1.Role.admin && request.requesterId !== requesterUserId) {
            throw new common_1.ForbiddenException('You do not have access to edit this request');
        }
        let bloodTypeId = request.bloodTypeId;
        if (dto.bloodType) {
            const bt = await this.bloodTypesService.findByName(dto.bloodType);
            bloodTypeId = bt.id;
        }
        return this.prisma.bloodRequest.update({
            where: { id },
            data: {
                bloodTypeId,
                requestType: dto.requestType !== undefined ? dto.requestType : undefined,
                hospitalName: dto.hospitalName !== undefined ? dto.hospitalName : undefined,
                hospitalAddress: dto.hospitalAddress !== undefined ? dto.hospitalAddress : undefined,
                latitude: dto.latitude !== undefined ? dto.latitude : undefined,
                longitude: dto.longitude !== undefined ? dto.longitude : undefined,
                unitsRequired: dto.unitsRequired !== undefined ? dto.unitsRequired : undefined,
                urgencyLevel: dto.urgencyLevel !== undefined ? dto.urgencyLevel : undefined,
                status: dto.status !== undefined ? dto.status : undefined,
                requesterPhone: dto.requesterPhone !== undefined ? dto.requesterPhone : undefined,
                preferredHospital: dto.preferredHospital !== undefined ? dto.preferredHospital : undefined,
                additionalNotes: dto.additionalNotes !== undefined ? dto.additionalNotes : undefined,
                coordinatorName: dto.coordinatorName !== undefined ? dto.coordinatorName : undefined,
                coordinatorContact: dto.coordinatorContact !== undefined ? dto.coordinatorContact : undefined,
            },
            include: {
                bloodType: true,
                requester: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });
    }
    async remove(id, requesterUserId, requesterRole) {
        const request = await this.prisma.bloodRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Blood request not found');
        }
        if (requesterRole !== client_1.Role.admin && request.requesterId !== requesterUserId) {
            throw new common_1.ForbiddenException('You do not have access to delete this request');
        }
        return this.prisma.bloodRequest.delete({
            where: { id },
        });
    }
    async updateStatus(id, requesterUserId, requesterRole, dto) {
        const request = await this.prisma.bloodRequest.findUnique({
            where: { id },
        });
        if (!request) {
            throw new common_1.NotFoundException('Blood request not found');
        }
        if (requesterRole !== client_1.Role.admin && request.requesterId !== requesterUserId) {
            throw new common_1.ForbiddenException('You do not have access to this request');
        }
        this.assertValidTransition(request.status, dto.status);
        return this.prisma.bloodRequest.update({
            where: { id },
            data: { status: dto.status },
            include: {
                bloodType: true,
                requester: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });
    }
    assertValidTransition(current, next) {
        const allowed = {
            [client_1.RequestStatus.pending]: [client_1.RequestStatus.matched, client_1.RequestStatus.cancelled],
            [client_1.RequestStatus.matched]: [client_1.RequestStatus.completed, client_1.RequestStatus.cancelled],
            [client_1.RequestStatus.completed]: [],
            [client_1.RequestStatus.cancelled]: [],
        };
        if (current === next)
            return;
        if (!allowed[current].includes(next)) {
            throw new common_1.BadRequestException(`Cannot transition blood request from "${current}" to "${next}"`);
        }
    }
};
exports.BloodRequestsService = BloodRequestsService;
exports.BloodRequestsService = BloodRequestsService = BloodRequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blood_types_service_1.BloodTypesService,
        donor_matching_service_1.DonorMatchingService,
        notifications_service_1.NotificationsService])
], BloodRequestsService);
//# sourceMappingURL=blood-requests.service.js.map