import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  const buildContext = (user: { role: Role } | undefined): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(buildContext({ role: Role.individual }))).toBe(true);
  });

  it('allows access when the user role matches a required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.individual]);
    expect(guard.canActivate(buildContext({ role: Role.individual }))).toBe(true);
  });

  it('denies access when the user role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.admin]);
    expect(guard.canActivate(buildContext({ role: Role.individual }))).toBe(false);
  });

  it('denies access when there is no authenticated user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.individual]);
    expect(guard.canActivate(buildContext(undefined))).toBe(false);
  });
});
