"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodTypesModule = void 0;
const common_1 = require("@nestjs/common");
const blood_types_service_1 = require("./blood-types.service");
const blood_types_controller_1 = require("./blood-types.controller");
let BloodTypesModule = class BloodTypesModule {
};
exports.BloodTypesModule = BloodTypesModule;
exports.BloodTypesModule = BloodTypesModule = __decorate([
    (0, common_1.Module)({
        controllers: [blood_types_controller_1.BloodTypesController],
        providers: [blood_types_service_1.BloodTypesService],
        exports: [blood_types_service_1.BloodTypesService],
    })
], BloodTypesModule);
//# sourceMappingURL=blood-types.module.js.map