"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const roles_guard_1 = require("./roles.guard");
describe('RolesGuard', () => {
    let reflector;
    let guard;
    const buildContext = (user) => ({
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => ({ user }) }),
    });
    beforeEach(() => {
        reflector = new core_1.Reflector();
        guard = new roles_guard_1.RolesGuard(reflector);
    });
    it('allows access when no roles are required', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
        expect(guard.canActivate(buildContext({ role: client_1.Role.individual }))).toBe(true);
    });
    it('allows access when the user role matches a required role', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.Role.individual]);
        expect(guard.canActivate(buildContext({ role: client_1.Role.individual }))).toBe(true);
    });
    it('denies access when the user role does not match', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.Role.admin]);
        expect(guard.canActivate(buildContext({ role: client_1.Role.individual }))).toBe(false);
    });
    it('denies access when there is no authenticated user', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.Role.individual]);
        expect(guard.canActivate(buildContext(undefined))).toBe(false);
    });
});
//# sourceMappingURL=roles.guard.spec.js.map