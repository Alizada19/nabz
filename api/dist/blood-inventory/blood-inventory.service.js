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
exports.BloodInventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let BloodInventoryService = class BloodInventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const bloodTypes = await this.prisma.bloodType.findMany();
        const records = await Promise.all(bloodTypes.map(async (bt) => {
            let inv = await this.prisma.bloodInventory.findUnique({
                where: { bloodTypeId: bt.id },
                include: { bloodType: true },
            });
            if (!inv) {
                inv = await this.prisma.bloodInventory.create({
                    data: {
                        bloodTypeId: bt.id,
                        unitsStored: 15,
                        minThreshold: 8,
                    },
                    include: { bloodType: true },
                });
            }
            return inv;
        }));
        return records;
    }
    async update(dto) {
        const bt = await this.prisma.bloodType.findUnique({
            where: { name: dto.bloodType },
        });
        if (!bt) {
            throw new common_1.NotFoundException(`Blood type ${dto.bloodType} not found`);
        }
        return this.prisma.bloodInventory.upsert({
            where: { bloodTypeId: bt.id },
            update: {
                unitsStored: dto.unitsStored,
                minThreshold: dto.minThreshold,
            },
            create: {
                bloodTypeId: bt.id,
                unitsStored: dto.unitsStored,
                minThreshold: dto.minThreshold,
            },
            include: { bloodType: true },
        });
    }
};
exports.BloodInventoryService = BloodInventoryService;
exports.BloodInventoryService = BloodInventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BloodInventoryService);
//# sourceMappingURL=blood-inventory.service.js.map