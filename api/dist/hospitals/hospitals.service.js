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
exports.HospitalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let HospitalsService = class HospitalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existingName = await this.prisma.hospital.findFirst({
            where: { name: dto.name },
        });
        if (existingName) {
            throw new common_1.ConflictException('Hospital with this name already exists');
        }
        const existingEmail = await this.prisma.hospital.findFirst({
            where: { email: dto.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Hospital with this email already exists');
        }
        return this.prisma.hospital.create({
            data: dto,
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = query.search
            ? {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { address: { contains: query.search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [items, total] = await Promise.all([
            this.prisma.hospital.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.hospital.count({ where }),
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id },
        });
        if (!hospital) {
            throw new common_1.NotFoundException('Hospital not found');
        }
        return hospital;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.hospital.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.hospital.delete({
            where: { id },
        });
    }
};
exports.HospitalsService = HospitalsService;
exports.HospitalsService = HospitalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HospitalsService);
//# sourceMappingURL=hospitals.service.js.map