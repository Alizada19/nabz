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
exports.BloodInventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const blood_inventory_service_1 = require("./blood-inventory.service");
const update_inventory_dto_1 = require("./dto/update-inventory.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let BloodInventoryController = class BloodInventoryController {
    constructor(bloodInventoryService) {
        this.bloodInventoryService = bloodInventoryService;
    }
    findAll() {
        return this.bloodInventoryService.findAll();
    }
    update(dto) {
        return this.bloodInventoryService.update(dto);
    }
};
exports.BloodInventoryController = BloodInventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all blood inventory stocks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BloodInventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, swagger_1.ApiOperation)({ summary: 'Update blood inventory stocks (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_inventory_dto_1.UpdateInventoryDto]),
    __metadata("design:returntype", void 0)
], BloodInventoryController.prototype, "update", null);
exports.BloodInventoryController = BloodInventoryController = __decorate([
    (0, swagger_1.ApiTags)('Blood Inventory'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('blood-inventory'),
    __metadata("design:paramtypes", [blood_inventory_service_1.BloodInventoryService])
], BloodInventoryController);
//# sourceMappingURL=blood-inventory.controller.js.map