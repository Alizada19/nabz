"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const configuration_1 = __importDefault(require("./config/configuration"));
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const blood_types_module_1 = require("./blood-types/blood-types.module");
const donor_profiles_module_1 = require("./donor-profiles/donor-profiles.module");
const blood_requests_module_1 = require("./blood-requests/blood-requests.module");
const matching_module_1 = require("./matching/matching.module");
const notifications_module_1 = require("./notifications/notifications.module");
const hospitals_module_1 = require("./hospitals/hospitals.module");
const blood_inventory_module_1 = require("./blood-inventory/blood-inventory.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('throttle.ttl') * 1000,
                        limit: config.get('throttle.limit'),
                    },
                ],
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            blood_types_module_1.BloodTypesModule,
            donor_profiles_module_1.DonorProfilesModule,
            matching_module_1.MatchingModule,
            blood_requests_module_1.BloodRequestsModule,
            notifications_module_1.NotificationsModule,
            hospitals_module_1.HospitalsModule,
            blood_inventory_module_1.BloodInventoryModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map