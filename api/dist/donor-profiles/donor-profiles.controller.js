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
exports.DonorProfilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const donor_profiles_service_1 = require("./donor-profiles.service");
const create_donor_profile_dto_1 = require("./dto/create-donor-profile.dto");
const update_donor_profile_dto_1 = require("./dto/update-donor-profile.dto");
const query_donors_dto_1 = require("./dto/query-donors.dto");
const create_donor_admin_dto_1 = require("./dto/create-donor-admin.dto");
const update_donor_admin_dto_1 = require("./dto/update-donor-admin.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DonorProfilesController = class DonorProfilesController {
    constructor(donorProfilesService) {
        this.donorProfilesService = donorProfilesService;
    }
    async create(user, dto) {
        const data = await this.donorProfilesService.createForUser(user.id, dto);
        return { message: 'Donor profile created successfully', data };
    }
    async getMine(user) {
        const data = await this.donorProfilesService.findByUserId(user.id);
        return { message: 'Donor profile retrieved successfully', data };
    }
    async updateMine(user, dto) {
        const data = await this.donorProfilesService.update(user.id, dto);
        return { message: 'Donor profile updated successfully', data };
    }
    async updateLocation(user, body) {
        const data = await this.donorProfilesService.updateLocation(user.id, body.latitude, body.longitude);
        return { message: 'Location updated successfully', data };
    }
    async removeMine(user) {
        const data = await this.donorProfilesService.removeForUser(user.id);
        return { message: 'Donor profile removed successfully', data };
    }
    async findAllDonors(query) {
        const data = await this.donorProfilesService.findAllDonors(query);
        return { message: 'Donors retrieved successfully', data };
    }
    async findOneDonor(id) {
        const data = await this.donorProfilesService.findOneDonor(id);
        return { message: 'Donor retrieved successfully', data };
    }
    async createDonor(dto) {
        const data = await this.donorProfilesService.createDonorAdmin(dto);
        return { message: 'Donor registered successfully', data };
    }
    async updateDonor(id, dto) {
        const data = await this.donorProfilesService.updateDonorAdmin(id, dto);
        return { message: 'Donor updated successfully', data };
    }
    async deleteDonor(id) {
        await this.donorProfilesService.deleteDonorAdmin(id);
        return { message: 'Donor deleted successfully' };
    }
};
exports.DonorProfilesController = DonorProfilesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Create a donor profile for the current individual' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_donor_profile_dto_1.CreateDonorProfileDto]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Get the current donor profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "getMine", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({
        summary: 'Update blood type, availability, or last donation date',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_donor_profile_dto_1.UpdateDonorProfileDto]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "updateMine", null);
__decorate([
    (0, common_1.Patch)('me/location'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: "Update the donor's current GPS location" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Remove donor profile (stop being an active donor)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "removeMine", null);
__decorate([
    (0, common_1.Get)('all-donors'),
    (0, swagger_1.ApiOperation)({ summary: 'List all individual blood donors (paginated with filters)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_donors_dto_1.QueryDonorsDto]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "findAllDonors", null);
__decorate([
    (0, common_1.Get)('all-donors/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a specific donor' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "findOneDonor", null);
__decorate([
    (0, common_1.Post)('all-donors'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Register/create a new individual donor (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_donor_admin_dto_1.CreateDonorAdminDto]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "createDonor", null);
__decorate([
    (0, common_1.Patch)('all-donors/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Update/Edit donor profile details (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_donor_admin_dto_1.UpdateDonorAdminDto]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "updateDonor", null);
__decorate([
    (0, common_1.Delete)('all-donors/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a donor user and profile (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonorProfilesController.prototype, "deleteDonor", null);
exports.DonorProfilesController = DonorProfilesController = __decorate([
    (0, swagger_1.ApiTags)('Donor Profiles'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('donor-profiles'),
    __metadata("design:paramtypes", [donor_profiles_service_1.DonorProfilesService])
], DonorProfilesController);
//# sourceMappingURL=donor-profiles.controller.js.map