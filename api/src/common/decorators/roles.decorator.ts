import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Attaches required roles to a route handler for use with RolesGuard.
 * Usage: @Roles(Role.admin, Role.individual)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
