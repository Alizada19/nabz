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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const donor_matching_service_1 = require("./donor-matching.service");
const nearby_donors_query_dto_1 = require("./dto/nearby-donors-query.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let DonorsController = class DonorsController {
    constructor(donorMatchingService) {
        this.donorMatchingService = donorMatchingService;
    }
    async findNearby(query) {
        const { items, total } = await this.donorMatchingService.findMatchingDonors({
            requiredBloodType: query.bloodType,
            latitude: query.latitude,
            longitude: query.longitude,
            radiusKm: query.radius,
            page: query.page,
            limit: query.limit,
        });
        const data = items.map(({ userId, ...safe }) => safe);
        return {
            message: 'Nearby donors retrieved successfully',
            data: {
                items: data,
                meta: {
                    total,
                    page: query.page ?? 1,
                    limit: query.limit ?? 10,
                    totalPages: Math.ceil(total / (query.limit ?? 10)),
                },
            },
        };
    }
    async listDonors(query) {
        const data = await this.donorMatchingService.listDonors(query);
        return { message: 'Donors list retrieved successfully', data };
    }
    async registerDonor(body) {
        const data = await this.donorMatchingService.registerDonor(body);
        return { message: 'Donor registered successfully', data };
    }
    async findOne(id) {
        const data = await this.donorMatchingService.findDonorById(id);
        return { message: 'Donor details retrieved successfully', data };
    }
    async update(id, body) {
        const data = await this.donorMatchingService.updateDonor(id, body);
        return { message: 'Donor updated successfully', data };
    }
    async remove(id) {
        await this.donorMatchingService.deleteDonor(id);
        return { message: 'Donor deleted successfully' };
    }
};
exports.DonorsController = DonorsController;
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({
        summary: 'Find nearby compatible donors for a required blood type',
        description: 'Returns compatible, available donors within the given radius, sorted by ' +
            'distance. Exact GPS coordinates and phone numbers are never returned — ' +
            'only approximate distance, city, availability and blood type.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nearby_donors_query_dto_1.NearbyDonorsQueryDto]),
    __metadata("design:returntype", Promise)
], DonorsController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'List individual blood donors with search and filters (Admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DonorsController.prototype, "listDonors", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new individual donor (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DonorsController.prototype, "registerDonor", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of an individual donor (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Edit an individual donor details (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DonorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an individual donor (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonorsController.prototype, "remove", null);
exports.DonorsController = DonorsController = __decorate([
    (0, swagger_1.ApiTags)('Donors'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('donors'),
    __metadata("design:paramtypes", [donor_matching_service_1.DonorMatchingService])
], DonorsController);
//# sourceMappingURL=donors.controller.js.map