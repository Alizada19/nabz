"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
describe('JwtAuthGuard', () => {
    let reflector;
    let guard;
    const buildContext = () => ({
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => ({}) }),
    });
    beforeEach(() => {
        reflector = new core_1.Reflector();
        guard = new jwt_auth_guard_1.JwtAuthGuard(reflector);
    });
    it('allows access without JWT validation when route is @Public()', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
        const context = buildContext();
        expect(guard.canActivate(context)).toBe(true);
    });
    it('delegates to the passport JWT strategy when route is not public', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const superCanActivate = jest
            .spyOn(Object.getPrototypeOf(jwt_auth_guard_1.JwtAuthGuard.prototype), 'canActivate')
            .mockReturnValue(true);
        const context = buildContext();
        const result = guard.canActivate(context);
        expect(superCanActivate).toHaveBeenCalled();
        expect(result).toBe(true);
    });
});
//# sourceMappingURL=jwt-auth.guard.spec.js.map