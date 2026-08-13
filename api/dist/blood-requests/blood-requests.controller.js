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
exports.BloodRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const blood_requests_service_1 = require("./blood-requests.service");
const create_blood_request_dto_1 = require("./dto/create-blood-request.dto");
const query_blood_request_dto_1 = require("./dto/query-blood-request.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const update_blood_request_dto_1 = require("./dto/update-blood-request.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let BloodRequestsController = class BloodRequestsController {
    constructor(bloodRequestsService) {
        this.bloodRequestsService = bloodRequestsService;
    }
    async create(user, dto) {
        const data = await this.bloodRequestsService.create(user.id, user.role, dto);
        return { message: 'Blood request created successfully', data };
    }
    async findAll(query) {
        const data = await this.bloodRequestsService.findAll(query);
        return { message: 'All blood requests retrieved successfully', data };
    }
    async findMine(user, query) {
        const data = await this.bloodRequestsService.findMyRequests(user.id, query);
        return { message: 'Blood requests retrieved successfully', data };
    }
    async findOne(user, id) {
        const data = await this.bloodRequestsService.findOne(id, user.id, user.role);
        return { message: 'Blood request retrieved successfully', data };
    }
    async update(user, id, dto) {
        const data = await this.bloodRequestsService.update(id, user.id, user.role, dto);
        return { message: 'Blood request updated successfully', data };
    }
    async remove(user, id) {
        await this.bloodRequestsService.remove(id, user.id, user.role);
        return { message: 'Blood request deleted successfully' };
    }
    async updateStatus(user, id, dto) {
        const data = await this.bloodRequestsService.updateStatus(id, user.id, user.role, dto);
        return { message: 'Blood request status updated successfully', data };
    }
};
exports.BloodRequestsController = BloodRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.hospital, client_1.Role.blood_bank, client_1.Role.ngo, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({
        summary: 'Create an emergency blood request',
        description: 'Automatically triggers compatible-donor matching and notifies nearby ' +
            'available donors within the configured radius.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_blood_request_dto_1.CreateBloodRequestDto]),
    __metadata("design:returntype", Promise)
], BloodRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all blood requests (paginated with filters)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_blood_request_dto_1.QueryBloodRequestDto]),
    __metadata("design:returntype", Promise)
], BloodRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.hospital, client_1.Role.blood_bank, client_1.Role.ngo, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: "List the current requester's blood requests (paginated)" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_blood_request_dto_1.QueryBloodRequestDto]),
    __metadata("design:returntype", Promise)
], BloodRequestsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single blood request by id' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BloodRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.hospital, client_1.Role.blood_bank, client_1.Role.ngo, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Update/Edit blood request details' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_blood_request_dto_1.UpdateBloodRequestDto]),
    __metadata("design:returntype", Promise)
], BloodRequestsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.hospital, client_1.Role.blood_bank, client_1.Role.ngo, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Delete blood request' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BloodRequestsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.individual, client_1.Role.hospital, client_1.Role.blood_bank, client_1.Role.ngo, client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Update the status of a blood request' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_status_dto_1.UpdateBloodRequestStatusDto]),
    __metadata("design:returntype", Promise)
], BloodRequestsController.prototype, "updateStatus", null);
exports.BloodRequestsController = BloodRequestsController = __decorate([
    (0, swagger_1.ApiTags)('Blood Requests'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('blood-requests'),
    __metadata("design:paramtypes", [blood_requests_service_1.BloodRequestsService])
], BloodRequestsController);
//# sourceMappingURL=blood-requests.controller.js.map